"""
YOLO Backend Server for PawGuard AI
Python Flask server that provides animal detection using YOLOv8
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import base64
import cv2
import numpy as np
import os
import torch
import clip
from datetime import datetime

# Fix for PyTorch 2.6+ weights_only security change
# Instead of allowlisting every individual class, we temporarily disable weights_only 
# for the model loading since we trust the ultralytics weight files.
import torch.serialization
original_load = torch.load

def robust_torch_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)

torch.load = robust_torch_load

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native requests

# Load YOLOv8 model (will auto-download on first run)
print("🔄 Loading YOLOv8 model...")
try:
    model = YOLO('yolov8n.pt')  # nano version for faster inference
    print("✅ YOLOv8 model loaded successfully!")
finally:
    # Restore original torch.load after model is loaded
    torch.load = original_load

# Load CLIP model for generating embeddings (identity fingerprints)
print("🔄 Loading CLIP model...")
clip_model, preprocess = clip.load("ViT-B/32", device="cpu")
print("✅ CLIP model loaded successfully!")

# COCO class names (15 is cat, 16 is dog in standard COCO)
ANIMAL_CLASSES = {
    15: 'cat',
    16: 'dog'
}

# Print available classes to verify
print("📋 Available classes in model:")
for i in [15, 16, 17]:
    if i in model.names:
        print(f"   [{i}]: {model.names[i]}")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "model": "YOLOv8n",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/detect', methods=['POST'])
def detect():
    """
    Detect animals in an image
    
    Request body:
    {
        "image": "base64_encoded_image"
    }
    
    Response:
    {
        "success": true,
        "detections": [...],
        "dog_detected": bool,
        "cat_detected": bool,
        "primary_detection": {...}
    }
    """
    try:
        # Get JSON data
        data = request.json
        if not data or 'image' not in data:
            print("❌ ERROR: No JSON data or 'image' key in request")
            return jsonify({
                "success": False,
                "error": "No image provided"
            }), 400
        
        # Decode base64 image
        image_b64 = data['image'].split(",")[-1]
        print(f"📦 Received base64 image. Length: {len(image_b64)} chars. Starts with: {image_b64[:30]}...")
        
        try:
            img_bytes = base64.b64decode(image_b64)
            print(f"📄 Decoded to {len(img_bytes)} bytes of binary data.")
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as decode_err:
            print(f"❌ ERROR: Base64 decoding or imdecode failed: {decode_err}")
            return jsonify({
                "success": False,
                "error": f"Decoding failed: {str(decode_err)}"
            }), 400
        
        if img is None:
            print("❌ ERROR: cv2.imdecode returned None. Image data might be corrupted.")
            return jsonify({
                "success": False,
                "error": "Failed to decode image (result was None)"
            }), 400
        
        print(f"📸 Image decoded successfully. Shape: {img.shape}")
        
        # DEBUG: Save image to verify it's received correctly
        debug_path = os.path.join(os.path.dirname(__file__), 'debug_received.jpg')
        cv2.imwrite(debug_path, img)
        print(f"💾 Debug image saved to: {debug_path}")
        
        # Run YOLO detection with lower threshold
        print("🎯 Running YOLOv8 inference...")
        results = model(img, conf=0.1, verbose=False) # Lowered to 0.1 for maximum sensitivity in logs
        
        # Process results
        detections = []
        raw_counts = {}
        
        for r in results:
            boxes = r.boxes
            print(f"📊 Raw model found {len(boxes)} total objects.")
            for i, box in enumerate(boxes):
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                xyxy = box.xyxy[0].cpu().numpy()
                class_name = model.names[class_id]
                
                raw_counts[class_name] = raw_counts.get(class_name, 0) + 1
                print(f"   [{i}] {class_name}: {confidence:.4f}")
                
                # Only keep cats (16) and dogs (17) in the final response (using 0.25 threshold for final)
                if class_id in ANIMAL_CLASSES and confidence >= 0.25:
                    detection = {
                        "class_id": class_id,
                        "class_name": ANIMAL_CLASSES[class_id],
                        "confidence": confidence,
                        "bbox": {
                            "x": float(xyxy[0]),
                            "y": float(xyxy[1]),
                            "width": float(xyxy[2] - xyxy[0]),
                            "height": float(xyxy[3] - xyxy[1])
                        }
                    }
                    detections.append(detection)
        
        print(f"📈 Summary: {raw_counts}")
        
        # Sort by confidence (highest first)
        detections.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Determine what was detected
        dog_detected = any(d['class_id'] == 17 for d in detections)
        cat_detected = any(d['class_id'] == 16 for d in detections)
        primary_detection = detections[0] if detections else None
        
        if len(detections) > 0:
            print(f"✅ SUCCESS: {len(detections)} animals filtered (Dogs: {dog_detected}, Cats: {cat_detected})")
        else:
            print(f"⚠️ FAILURE: No animals passed the 0.25 threshold.")

        # Generate embedding for the primary detection
        embedding_list = None
        if primary_detection:
            print("🔍 Generating CLIP embedding for primary detection...")
            bbox = primary_detection['bbox']
            x1 = int(bbox['x'])
            y1 = int(bbox['y'])
            x2 = int(x1 + bbox['width'])
            y2 = int(y1 + bbox['height'])
            
            # Crop the animal from the image
            cropped_img = img[y1:y2, x1:x2]
            
            # Convert BGR (OpenCV) to RGB (PIL/CLIP)
            from PIL import Image
            cropped_rgb = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(cropped_rgb)
            
            # Preprocess and generate embedding
            image_input = preprocess(pil_image).unsqueeze(0)
            with torch.no_grad():
                embedding = clip_model.encode_image(image_input)
                # Normalize the embedding
                embedding = embedding / embedding.norm(dim=-1, keepdim=True)
                embedding_list = embedding.squeeze().cpu().numpy().tolist()
            
            print(f"✅ Embedding generated: {len(embedding_list)} dimensions")
        
        return jsonify({
            "success": True,
            "detections": detections,
            "dog_detected": dog_detected,
            "cat_detected": cat_detected,
            "primary_detection": primary_detection,
            "embedding": embedding_list
        })
        
    except Exception as e:
        print(f"❌ Error processing image: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        "name": "PawGuard AI - YOLO Backend",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "detect": "/detect (POST)"
        }
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🐾 PawGuard AI - YOLO Backend Server")
    print("="*50)
    print("✅ Server starting on http://localhost:5000")
    print("✅ Health check: http://localhost:5000/health")
    print("✅ Detection endpoint: POST http://localhost:5000/detect")
    print("="*50 + "\n")
    
    # Run the server
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=5000,
        debug=True,
        threaded=True
    )
