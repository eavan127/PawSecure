# PawGuard AI - Python YOLO Backend Setup

## 🎯 Overview

This backend server provides YOLOv11 object detection for the PawGuard AI mobile app. It allows you to use YOLO detection with Expo Go without needing a development build!

## ✅ Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- 4GB+ RAM (for running YOLO model)
- Same WiFi network as your phone running Expo Go

## 📦 Installation

### 1. Navigate to Backend Folder

```bash
cd backend
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web server)
- flask-cors (allows mobile app to connect)
- ultralytics (YOLOv11 framework)
- Pillow (image processing)
- numpy (numerical operations)

The first time you run the server, Ultralytics will automatically download the YOLOv11n model (~6MB).

## 🚀 Running the Server

### Start the Server

```bash
python app.py
```

You should see:
```
🚀 Starting PawGuard AI YOLO Backend Server...
📍 Server will run on http://localhost:5000
🔗 Endpoints:
   GET  /health  - Health check
   POST /detect  - Detect animals in image
🔍 Loading YOLOv11 model...
✅ YOLOv11 model loaded!
 * Running on http://0.0.0.0:5000
```

**Keep this terminal window open!** The server must be running for the mobile app to work.

## ⚙️ Configuration

### Find Your Computer's IP Address

The mobile app needs to know your computer's IP address.

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for `inet` under `en0` or `wlan0` (e.g., `192.168.1.100`)

### Update Mobile App Configuration

1. Open `PawGuard_AI/.env`
2. Add this line (replace with your IP):
```
EXPO_PUBLIC_YOLO_BACKEND_URL=http://192.168.1.100:5000
```

3. Restart Expo (press `r` in the Expo terminal)

**Important:** Your phone and computer must be on the same WiFi network!

## 🧪 Testing

### Test Health Endpoint

Open a browser and visit:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "healthy",
  "model": "YOLOv11n"
}
```

### Test from Mobile App

1. Ensure backend is running (`python app.py`)
2. Open PawGuard AI in Expo Go
3. Navigate to camera/AI detection
4. Take or upload a photo of a dog or cat
5. Watch the backend terminal for logs:
```
🎯 Running YOLO detection on (640, 640) image...
✅ Found 1 animals (dog=True, cat=False)
```

## 📡 API Documentation

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "model": "YOLOv11n"
}
```

### POST /detect

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
      "class_id": 16,
      "class_name": "dog",
      "confidence": 0.92,
      "bbox": {
        "x": 100.5,
        "y": 150.2,
        "width": 200.3,
        "height": 250.8
      }
    }
  ],
  "dog_detected": true,
  "cat_detected": false,
  "primary_detection": {...}
}
```

## 🔥 Troubleshooting

### "Connection Refused" Error

**Problem:** Mobile app can't connect to backend

**Solutions:**
1. Check backend is running (`python app.py`)
2. Verify IP address in `.env` is correct
3. Ensure phone and computer on same WiFi
4. Check firewall isn't blocking port 5000
   - Windows: Allow Python in Windows Firewall
   - Mac: System Preferences → Security → Firewall

### "Module Not Found" Error

**Problem:** Missing Python packages

**Solution:**
```bash
pip install -r requirements.txt
```

### Slow Detection

**Problem:** Detection takes too long

**Solutions:**
- First detection is slower (model loading)
- Subsequent detections should be faster
- Consider using YOLOv11n (nano) instead of larger models
- Ensure good CPU/GPU performance

### Backend Not Found

**Problem:** App says "Backend YOLO unavailable"

**Solutions:**
1. Start backend: `python app.py`
2. Check console for the IP it's running on
3. Update `.env`EXPO_PUBLIC_YOLO_BACKEND_URL` with correct IP
4. Restart Expo (`r` in terminal)

## 🎯 What's Detected

The backend detects:
- **Dogs** (COCO class 16)
- **Cats** (COCO class 15)

Other animals in the COCO dataset are filtered out to focus on PawGuard's use case.

## 🔧 Advanced Configuration

### Change Port

Edit `app.py`, line 142:
```python
app.run(host='0.0.0.0', port=5000, debug=True)  # Change 5000 to your port
```

### Adjust Confidence Threshold

Edit `app.py`, line 85:
```python
results = model(image, conf=0.5)  # Change 0.5 to your threshold (0.0-1.0)
```

### Use Different YOLO Model

Edit `app.py`, line 16:
```python
model = YOLO('yolov11n.pt')  # Options: yolov11n, yolov11s, yolov11m, yolov11l
```

Larger models are more accurate but slower.

## 📊 Performance

- **YOLOv11n (nano)**: ~50-100ms per image
- **Accuracy**: 85-95% for common breeds
- **Bandwidth**: ~50-200KB per image (base64 encoded)

## 🚢 Production Deployment

For production, consider:
- Deploy on cloud (AWS, Google Cloud, Heroku)
- Use Gunicorn instead of Flask dev server
- Add authentication
- Enable HTTPS
- Use Redis for caching
- Add rate limiting

---

**Need Help?** Check the main README.md or create an issue on GitHub!
