# YOLO Backend Server

Python Flask server for PawGuard AI that provides YOLOv8-based animal detection.

## Quick Start

### 1. Install Python Dependencies

```bash
cd yolo_backend
pip install -r requirements.txt
```

**Note:** The first install may take 5-10 minutes as it downloads PyTorch and other dependencies.

### 2. Run the Server

```bash
python yolo_server.py
```

The server will:
- Auto-download YOLOv8n model on first run (~6MB)
- Start on `http://localhost:5000`
- Display available endpoints

### 3. Test the Server

Open your browser and visit:
- http://localhost:5000 - Server info
- http://localhost:5000/health - Health check

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "model": "YOLOv8n",
  "timestamp": "2026-01-25T16:22:00"
}
```

### POST /detect
Detect animals in an image.

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "success": true,
  "detections": [
    {
      "class_id": 17,
      "class_name": "dog",
      "confidence": 0.95,
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
  "primary_detection": { ... }
}
```

## Configuration

The server runs on:
- **Host:** `0.0.0.0` (accessible from network)
- **Port:** `5000`
- **Model:** YOLOv8n (nano - fast and lightweight)

To change the port, edit `yolo_server.py`:
```python
app.run(host='0.0.0.0', port=YOUR_PORT, debug=True)
```

## Supported Animals

- **Dog** (COCO class 17)
- **Cat** (COCO class 16)

## Troubleshooting

### "No module named 'flask'"
```bash
pip install -r requirements.txt
```

### "Cannot connect to server"
Make sure the server is running:
```bash
python yolo_server.py
```

### Slow first run
The YOLOv8 model auto-downloads on first run (~6MB). Subsequent runs are instant.

### GPU Support (Optional)
If you have an NVIDIA GPU, install:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## Development

The server uses:
- **Flask** - Web framework
- **YOLOv8n** - Object detection model
- **OpenCV** - Image processing
- **CORS** - Cross-origin support for React Native

## Production Deployment

For production, use a WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 yolo_server:app
```
