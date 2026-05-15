"""
PawSecure — FastAPI Backend
Replaces the old Flask app.py

Run with:  uvicorn main:app --reload --host 0.0.0.0 --port 8000
Docs at:   http://localhost:8000/docs  (FastAPI gives this FREE)
"""

# ── Imports ───────────────────────────────────────────────────────────────────

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel          # enforces the shape of incoming JSON
from ultralytics import YOLO
import open_clip                        # OpenCLIP for animal re-identification
import torch
import cv2
import numpy as np
from PIL import Image
import base64
import io

# ── App Setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="PawSecure AI Backend",
    description="Animal detection (YOLO) + re-identification (CLIP)",
    version="2.0.0",
)

# Allow the React Native app to call this server (same as Flask-CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # lock this down in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Models (runs ONCE when server starts) ────────────────────────────────

print("Loading YOLO model...")
try:
    yolo = YOLO("yolo11n.pt")   # downloads ~6MB on first run
    print("YOLO yolo11n loaded.")
except Exception:
    yolo = YOLO("yolov8n.pt")   # fallback
    print("YOLO yolov8n loaded (fallback).")

print("Loading CLIP model...")
# ViT-B-32 is the lightweight version — good balance of speed vs accuracy
# 'openai' means we use OpenAI's pretrained weights (free to download)
clip_model, _, clip_preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="openai"
)
clip_model.eval()   # eval mode = no gradient tracking = faster inference
print("CLIP ViT-B-32 loaded.")

# COCO dataset class IDs for animals YOLO knows
CAT_CLASS_ID = 15
DOG_CLASS_ID = 16

# ── Pydantic Schemas ──────────────────────────────────────────────────────────
#
# These are like TypeScript interfaces but for Python.
# FastAPI validates incoming JSON against these automatically.
# Wrong data from the client → 422 error, no extra code needed.

class ImageRequest(BaseModel):
    image: str          # base64-encoded image string

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class Detection(BaseModel):
    class_id: int
    class_name: str     # "dog" or "cat"
    confidence: float
    bbox: BoundingBox

class DetectResponse(BaseModel):
    success: bool
    detections: list[Detection]
    dog_detected: bool
    cat_detected: bool
    primary_detection: Detection | None     # highest-confidence detection

class EmbedRequest(BaseModel):
    image: str          # base64 of the CROPPED animal (not the full frame)

class EmbedResponse(BaseModel):
    success: bool
    embedding: list[float]      # 512 numbers — the animal's "fingerprint"
    embedding_dim: int          # always 512 for ViT-B-32

class InjuryResponse(BaseModel):
    success: bool
    has_blood: bool
    severity: str       # "none" | "mild" | "moderate" | "severe"
    signals: list[str]  # e.g. ["red_region_detected", "abnormal_aspect_ratio"]

# ── Helper Functions ──────────────────────────────────────────────────────────

def decode_base64_image(b64_string: str) -> Image.Image:
    """
    Converts a base64 string → PIL Image.
    The mobile app sends images this way to avoid multipart form complexity.
    """
    image_bytes = base64.b64decode(b64_string)
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")    # YOLO and CLIP both expect RGB
    return image


def pil_to_cv2(pil_image: Image.Image) -> np.ndarray:
    """
    PIL Image → OpenCV numpy array.
    OpenCV uses BGR channel order, PIL uses RGB — so we swap channels.
    """
    rgb_array = np.array(pil_image)
    bgr_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
    return bgr_array


def detect_injury_signals(pil_image: Image.Image) -> dict:
    """
    Rule-based injury detection using colour analysis.

    HOW IT WORKS:
    1. Convert image to HSV colour space (Hue, Saturation, Value).
       HSV is better than RGB for colour detection because hue is isolated
       from brightness — a dark red and bright red have the same hue.
    2. Create a mask for red pixels (blood has a specific hue range).
    3. If >1% of pixels are red → flag as blood present.
    4. Check aspect ratio — a very wide bounding box may mean the animal
       is lying down (collapsed). Very tall may mean it is holding a leg up.
    """
    cv_image = pil_to_cv2(pil_image)
    hsv = cv2.cvtColor(cv_image, cv2.COLOR_BGR2HSV)

    # Red in HSV wraps around 0 and 180, so we need two ranges
    lower_red1 = np.array([0,   70,  50])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 70,  50])
    upper_red2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    red_mask = cv2.bitwise_or(mask1, mask2)

    total_pixels = cv_image.shape[0] * cv_image.shape[1]
    red_pixel_ratio = np.sum(red_mask > 0) / total_pixels

    signals = []
    has_blood = red_pixel_ratio > 0.01     # more than 1% red pixels

    if has_blood:
        signals.append("red_region_detected")

    h, w = cv_image.shape[:2]
    aspect_ratio = w / h if h > 0 else 1.0
    if aspect_ratio > 2.5:
        signals.append("abnormal_aspect_ratio_collapsed")
    elif aspect_ratio < 0.4:
        signals.append("abnormal_aspect_ratio_limping")

    # Severity derived from combination of signals
    if not signals:
        severity = "none"
    elif has_blood and len(signals) >= 2:
        severity = "severe"
    elif has_blood:
        severity = "moderate"
    else:
        severity = "mild"

    return {
        "has_blood": has_blood,
        "severity": severity,
        "signals": signals,
    }

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Quick ping to confirm the server is alive."""
    return {"status": "healthy", "models": ["yolo", "clip"]}


@app.post("/detect", response_model=DetectResponse)
async def detect(body: ImageRequest):
    """
    STEP 1 — Find animals in a CCTV frame.

    Input:  base64 full frame
    Output: bounding boxes with class (dog/cat) and confidence score

    The mobile app uses these bbox coordinates to:
    - Draw boxes on screen so the user can see what was detected
    - Crop the animal region for /embed and /injury calls
    """
    try:
        image = decode_base64_image(body.image)
        results = yolo(image, conf=0.5)

        detections: list[Detection] = []
        dog_detected = False
        cat_detected = False

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                if class_id not in [CAT_CLASS_ID, DOG_CLASS_ID]:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                class_name = "dog" if class_id == DOG_CLASS_ID else "cat"

                detections.append(Detection(
                    class_id=class_id,
                    class_name=class_name,
                    confidence=confidence,
                    bbox=BoundingBox(x=x1, y=y1, width=x2 - x1, height=y2 - y1),
                ))

                if class_id == DOG_CLASS_ID:
                    dog_detected = True
                if class_id == CAT_CLASS_ID:
                    cat_detected = True

        detections.sort(key=lambda d: d.confidence, reverse=True)
        primary = detections[0] if detections else None

        return DetectResponse(
            success=True,
            detections=detections,
            dog_detected=dog_detected,
            cat_detected=cat_detected,
            primary_detection=primary,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embed", response_model=EmbedResponse)
async def embed(body: ImageRequest):
    """
    STEP 2 — Generate the animal's identity fingerprint (embedding).

    Input:  base64 of the CROPPED animal region (not the full frame)
    Output: 512 float numbers representing this animal's visual identity

    Store this in Supabase pgvector table 'animal_embeddings'.
    To check if two sightings are the same animal, compute cosine
    similarity between their embeddings:
      - Score > 0.85  →  very likely the same animal
      - Score < 0.60  →  different animals

    WHY CLIP?
    CLIP was trained on 400 million image-text pairs and learned rich
    visual features (fur patterns, body shape, eye structure). These
    generalise well to animal re-identification even without task-specific
    training.
    """
    try:
        image = decode_base64_image(body.image)

        # clip_preprocess: resize to 224×224, normalise pixel values
        # unsqueeze(0): adds batch dimension → shape [1, 3, 224, 224]
        tensor = clip_preprocess(image).unsqueeze(0)

        with torch.no_grad():   # no gradients needed — we are not training
            features = clip_model.encode_image(tensor)  # shape: [1, 512]
            # L2 normalise so cosine similarity == dot product (faster in Supabase)
            features = features / features.norm(dim=-1, keepdim=True)

        embedding = features[0].tolist()    # tensor → plain Python list of 512 floats

        return EmbedResponse(
            success=True,
            embedding=embedding,
            embedding_dim=len(embedding),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/injury", response_model=InjuryResponse)
async def injury(body: ImageRequest):
    """
    STEP 3 — Classify injury severity from a cropped animal image.

    Input:  base64 of the cropped animal
    Output: severity level + list of detected visual signals

    Severity levels: none → mild → moderate → severe
    ('critical' is reserved for disaster-zone animals — set in app logic)

    Current approach is rule-based (colour + shape analysis).
    A production upgrade would fine-tune a classifier on CLIP features
    using labelled injury images.
    """
    try:
        image = decode_base64_image(body.image)
        result = detect_injury_signals(image)

        return InjuryResponse(
            success=True,
            has_blood=result["has_blood"],
            severity=result["severity"],
            signals=result["signals"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/pipeline")
async def full_pipeline(body: ImageRequest):
    """
    Convenience endpoint: detect + embed + injury in ONE call.

    The mobile app calls this single endpoint when processing a CCTV frame.
    It returns everything needed to create an animal record in Supabase.

    Internal flow:
      1. YOLO scans the full frame for animals
      2. For each animal found, crop the bounding box region
      3. CLIP generates a 512-dim embedding from the crop
      4. Injury analysis runs on the same crop
      5. All results are returned together
    """
    try:
        image = decode_base64_image(body.image)
        img_array = np.array(image)

        results = yolo(image, conf=0.5)
        pipeline_results = []

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                if class_id not in [CAT_CLASS_ID, DOG_CLASS_ID]:
                    continue

                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                confidence = float(box.conf[0])
                class_name = "dog" if class_id == DOG_CLASS_ID else "cat"

                # Crop the detected animal from the full frame
                crop = img_array[y1:y2, x1:x2]
                if crop.size == 0:
                    continue
                crop_pil = Image.fromarray(crop)

                # CLIP embedding
                tensor = clip_preprocess(crop_pil).unsqueeze(0)
                with torch.no_grad():
                    features = clip_model.encode_image(tensor)
                    features = features / features.norm(dim=-1, keepdim=True)
                embedding = features[0].tolist()

                # Injury signals
                injury_data = detect_injury_signals(crop_pil)

                pipeline_results.append({
                    "class_name": class_name,
                    "confidence": confidence,
                    "bbox": {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1},
                    "embedding": embedding,
                    "injury": injury_data,
                })

        return {
            "success": True,
            "animal_count": len(pipeline_results),
            "animals": pipeline_results,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
