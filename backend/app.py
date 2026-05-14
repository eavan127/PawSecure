"""
PawGuard AI - YOLO Detection Backend Server
Flask API server for animal detection using YOLOv11
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import base64
import io
from PIL import Image
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app

# Load YOLOv11 model
print("🔍 Loading YOLOv11 model...")
print("📥 Note: First run will download the model (~6MB)")
try:
    model = YOLO('yolov11n.pt')  # Will download automatically if not present
    print("✅ YOLOv11 model loaded!")
except Exception as e:
    print(f"⚠️ Warning: Could not load YOLOv11n, trying yolov8n as fallback...")
    model = YOLO('yolov8n.pt')  # Fallback to YOLOv8 if v11 not available
    print("✅ YOLOv8n model loaded!")

# COCO class IDs
DOG_CLASS_ID = 16
CAT_CLASS_ID = 15

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model": "YOLOv11n"})

@app.route('/detect', methods=['POST'])
def detect():
    """
    Detect animals in uploaded image
    
    Request body:
    {
        "image": "base64_encoded_image_string"
    }
    
    Response:
    {
        "success": true,
        "detections": [
            {
                "class_id": 16,
                "class_name": "dog",
                "confidence": 0.92,
                "bbox": {
                    "x": 100,
                    "y": 150,
                    "width": 200,
                    "height": 250
                }
            }
        ],
        "dog_detected": true,
        "cat_detected": false,
        "primary_detection": {...}
    }
    """
    try:
        # Get base64 image from request
        data = request.get_json()
        if 'image' not in data:
            return jsonify({"success": False, "error": "No image provided"}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Run YOLO detection
        print(f"🎯 Running YOLO detection on {image.size} image...")
        results = model(image, conf=0.5)  # 50% confidence threshold
        
        # Parse results
        detections = []
        dog_detected = False
        cat_detected = False
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                # Only return cats (15) and dogs (16)
                if class_id in [DOG_CLASS_ID, CAT_CLASS_ID]:
                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    
                    detection = {
                        "class_id": class_id,
                        "class_name": "dog" if class_id == DOG_CLASS_ID else "cat",
                        "confidence": confidence,
                        "bbox": {
                            "x": x1,
                            "y": y1,
                            "width": x2 - x1,
                            "height": y2 - y1
                        }
                    }
                    
                    detections.append(detection)
                    
                    if class_id == DOG_CLASS_ID:
                        dog_detected = True
                    elif class_id == CAT_CLASS_ID:
                        cat_detected = True
        
        # Sort by confidence
        detections.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Get primary detection (highest confidence)
        primary_detection = detections[0] if detections else None
        
        print(f"✅ Found {len(detections)} animals (dog={dog_detected}, cat={cat_detected})")
        
        return jsonify({
            "success": True,
            "detections": detections,
            "dog_detected": dog_detected,
            "cat_detected": cat_detected,
            "primary_detection": primary_detection
        })
        
    except Exception as e:
        print(f"❌ Error during detection: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting PawGuard AI YOLO Backend Server...")
    print("📍 Server will run on http://localhost:5000")
    print("🔗 Endpoints:")
    print("   GET  /health  - Health check")
    print("   POST /detect  - Detect animals in image")
    app.run(host='0.0.0.0', port=5000, debug=True)
