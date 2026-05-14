# Quick Start Guide - YOLO Backend + Expo Go

Get YOLOv11 detection working with Expo Go in 5 minutes!

## Step 1: Install Python Dependencies (2 mins)

```bash
cd backend
pip install -r requirements.txt
```

## Step 2: Start Backend Server (30 seconds)

```bash
python app.py
```

You'll see:
```
🔍 Loading YOLOv11 model...
✅ YOLOv11 model loaded!
🚀 Starting PawGuard AI YOLO Backend Server...
 * Running on http://0.0.0.0:5000
```

**Keep this terminal open!**

## Step 3: Find Your Computer's IP (1 min)

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

## Step 4: Configure Mobile App (1 min)

1. Open `PawGuard_AI/.env`
2. Update this line with YOUR IP:
```
EXPO_PUBLIC_YOLO_BACKEND_URL=http://192.168.1.100:5000
```
Replace `192.168.1.100` with your actual IP!

3. Save the file

## Step 5: Restart Expo (30 seconds)

In the Expo terminal, press `r` to reload

## Step 6: Test Detection! (1 min)

1. Open app in Expo Go
2. Go to camera/AI detection
3. Take or upload a dog/cat photo
4. Watch the magic happen!

**Console logs you'll see:**
```
🎯 Attempting Backend YOLO detection...
✅ Backend available: YOLOv11n
📤 Sending image to backend...
✅ Backend detected 1 animals
```

## ✅ Success Checklist

- [ ] Backend running (`python app.py`)
- [ ] IP address found
- [ ] `.env` updated with correct IP
- [ ] Expo reloaded (pressed `r`)
- [ ] Phone and computer on same WiFi
- [ ] Detection works!

## 🐛 Troubleshooting

**"Backend YOLO unavailable"**
→ Check backend is running
→ Verify IP address in `.env`
→ Ensure same WiFi network

**"Connection refused"**
→ Check firewall (allow Python on port 5000)
→ Try `http://localhost:5000` first

**Need detailed help?**
→ See `backend/README.md`

---

**That's it!** 🎉 You now have YOLOv11 detection working with Expo Go!
