"""
PawSecure — FastAPI Backend
Replaces the old Flask app.py

Run with:  uvicorn main:app --reload --host 0.0.0.0 --port 8000
Docs at:   http://localhost:8000/docs  (FastAPI gives this FREE)
"""

# Imports 

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel          # enforces the shape of incoming JSON
from ultralytics import YOLO
import torch
import cv2
import numpy as np
from PIL import Image 
# pillow, python imaging library, convert image into PIL as input for yolo & Resnet
import base64
import io
import torchvision.models as models
import torchvision.transforms as transforms

# App Setup 

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

# Load Models (runs when server starts) 

print("Loading YOLO model...")
try:
    yolo = YOLO("yolo11n.pt")   # yolo newest model
    print("YOLO yolo11n loaded.")
except Exception:
    yolo = YOLO("yolov8n.pt")   # fallback to old version
    print("YOLO yolov8n loaded (fallback).")

print("Loading ResNet18 embedding model...")
embed_model = models.resnet18(weights='IMAGENET1K_V1')
# load the pretrained model
# Layer 1-3:   detects edges, corners, colours
# Layer 4-8:   detects textures (fur, scales, feathers)
# Layer 9-15:  detects parts (eyes, ears, legs)
# Layer 16-18: detects whole objects (this is a dog)
embed_model.fc = torch.nn.Identity()   # remove classification head = 512-dim output
embed_model.eval() 
# switch the model into evaluation mode

embed_preprocess = transforms.Compose([
    transforms.Resize(256),
    # transform into 256 x 256 fixed size
    transforms.CenterCrop(224),
    # crop out the center
    transforms.ToTensor(),
    # convert PIL image into tensor
    # reshapes and rescales (format like 0 - 255 to 0.0-1.0)
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
                        #  shifts every image to have the same center
                        # normalize the brightness for red, green and blue
])
print("ResNet18 loaded.")

# COCO dataset class IDs  (yolo was trained based on COCO dataset)
# has 80 object categories, we take 15 and 16 only 
CAT_CLASS_ID = 15
DOG_CLASS_ID = 16

#  Pydantic Schemas 
# These are like TypeScript interfaces but for Python.
# FastAPI validates incoming JSON against these automatically.
# Wrong data from the client will lead to 422 error, no extra code needed.

class ImageRequest(BaseModel):
    image: str          # base64-encoded image string

class BoundingBox(BaseModel):
    x: float
    y: float
    # x, y top left corner of the box, the coordinate
    width: float
    height: float

class Detection(BaseModel):
    class_id: int  # 15 or 16 
    class_name: str     # "dog" or "cat"
    confidence: float # 0.0 to 1.0
    bbox: BoundingBox  # { "x": 120, "y": 80, "width": 200, "height": 180 }

class DetectResponse(BaseModel):
    success: bool
    detections: list[Detection] # a list of detection objects
    dog_detected: bool
    cat_detected: bool
    primary_detection: Detection | None     # highest-confidence detection # no animal found = NULL

class EmbedRequest(BaseModel):
    image: str          # base64 of the CROPPED animal (not the full frame)

class EmbedResponse(BaseModel):
    success: bool
    embedding: list[float]      # 512 numbers 
    embedding_dim: int          # always 512 for ViT-B-32

class InjuryResponse(BaseModel):
    success: bool
    has_blood: bool
    severity: str       # "none" | "mild" | "moderate" | "severe"
    signals: list[str]  # e.g. ["red_region_detected", "abnormal_aspect_ratio"]

#  Helper Functions 

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
    #  cvt = convert color order
    #  PIL = R G B OPEN CV = B G R
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
    #  convert to hsv heu (the actual colour),saturation (how vivid the colour is),  value (hor bright or dark it is)

    # Red in HSV wraps around 0 and 180, so we need two ranges
    lower_red1 = np.array([0,   70,  50])
    upper_red1 = np.array([10, 255, 255])
    # H between 0  and 10  → must be in the red zone of the wheel
    # S between 70 and 255 → must be vivid enough (not pale/grey)
    # V between 50 and 255 → must be bright enough (not black/dark)
    # all must fulfill to determine it is red enough

    lower_red2 = np.array([160, 70,  50])
    upper_red2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    # only allow the range between to be the mask 
    red_mask = cv2.bitwise_or(mask1, mask2)
    # has either one mask result to 255 

    total_pixels = cv_image.shape[0] * cv_image.shape[1]
    #  shape 0 = height , shape 1 = weidth
    red_pixel_ratio = np.sum(red_mask > 0) / total_pixels
    #  if got is 255 then maning > 0, if no then is 0 then also false
    # total up the 255's no of pixels 

    signals = []
    has_blood = bool(red_pixel_ratio > 0.01)     # more than 1% red pixels — cast to Python bool (not numpy.bool_)

    if has_blood:
        signals.append("red_region_detected")

    h, w = cv_image.shape[:2]
    # ignore the third which is the colour channel
    aspect_ratio = w / h if h > 0 else 1.0
    if aspect_ratio > 2.5:
        # check if the ratio wide or not, if 400 wide 100 tall then 400/100 = 4.0 meaning very wide
        signals.append("abnormal_aspect_ratio_collapsed")
    elif aspect_ratio < 0.4:
        signals.append("abnormal_aspect_ratio_limping")
        # if 100 width / 400 tall = 0.25 meaning very tall 

    # Severity derived from combination of signals
    if not signals: 
        # meaning if signals is empty
        severity = "none"
    elif has_blood and len(signals) >= 2:
        severity = "severe"
        # either too wide or too tall
        #  with red 
    elif has_blood:
        severity = "moderate"
        # only red region detected
    else:
        severity = "mild"
        # abnormal ratio collapsed/limping
        # no blood, only length > 2

    return {
        "has_blood": has_blood,
        "severity": severity,
        "signals": signals,
    }

#  Endpoints 

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
        # convert base62string to PIL image
        results = yolo(image, conf=0.5)
        # confidence threshold 

        detections: list[Detection] = []
        dog_detected = False
        cat_detected = False

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                # fr , 0=person, 16=dog
                if class_id not in [CAT_CLASS_ID, DOG_CLASS_ID]:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()
                # returns bounding box as two corner points 
                # top-left and bottom-right
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
        # sort descendingly
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
    """
    try:
        image = decode_base64_image(body.image)
        
        tensor = embed_preprocess(image).unsqueeze(0)
        # add a batch dimension at position 0
        # bc net can process many images at once 
        # [1, 3, 224, 224]

        with torch.no_grad():
            features = embed_model(tensor)                          # shape: [1, 512]
            # run the image through all 18 layers
            features = features / features.norm(dim=-1, keepdim=True)  
            # L2 normalise

        embedding = features[0].tolist()

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
    Fast pipeline: YOLO detection + injury analysis only.

    Internal flow:
      1. YOLO scans the full frame for animals
      2. For each animal found, crop the bounding box region
      3. Injury analysis runs on the crop (fast, rule-based)
      4. Results returned immediately 
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

                crop = img_array[y1:y2, x1:x2]
                if crop.size == 0:
                    continue
                crop_pil = Image.fromarray(crop)

                raw_injury = detect_injury_signals(crop_pil)
                injury_data = {
                    "has_blood": bool(raw_injury["has_blood"]),
                    "severity":  str(raw_injury["severity"]),
                    "signals":   [str(s) for s in raw_injury["signals"]],
                }

                pipeline_results.append({
                    "class_name": str(class_name),
                    "confidence": float(confidence),
                    "bbox": {
                        "x":      int(x1),
                        "y":      int(y1),
                        "width":  int(x2 - x1),
                        "height": int(y2 - y1),
                    },
                    "injury": injury_data,
                })

        return {
            "success": True,
            "animal_count": len(pipeline_results),
            "animals": pipeline_results,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
