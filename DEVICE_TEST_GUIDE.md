# Device Testing Guide

This guide provides comprehensive instructions for testing PawGuardAI on Android devices.

## Prerequisites

### 1. Hardware Requirements
- **Android Device** (Physical device recommended)
  - Android 7.0 (API 24) or higher
  - Minimum 2GB RAM (4GB+ recommended for optimal AI performance)
  - Camera with at least 5MP resolution
  - Adequate storage space (500MB+)

### 2. Software Requirements
- **Flutter SDK** (latest stable version)
- **Android Studio** or **VS Code** with Flutter extensions
- **ADB (Android Debug Bridge)** installed and accessible in PATH
- **USB Cable** for device connection

### 3. Device Configuration
- **Developer Options** enabled
- **USB Debugging** enabled
- **Install via USB** enabled (for some devices)

---

## Setting Up Your Device

### Enable Developer Options

1. Open **Settings** on your Android device
2. Navigate to **About Phone**
3. Tap **Build Number** 7 times
4. You should see a message: "You are now a developer!"

### Enable USB Debugging

1. Go to **Settings** > **System** > **Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB** (if available)
4. Enable **Stay Awake** (prevents screen timeout during testing)

### Connect Device to Computer

1. Connect device via USB cable
2. On your device, allow USB debugging when prompted
3. Verify connection:
   ```bash
   adb devices
   ```
   You should see your device listed with status "device"

---

## Running the App

### Method 1: Using Flutter Run (Recommended)

```bash
# Navigate to project directory
cd c:\Users\ASUS\Downloads\club-website-2018-master\pawguard-ai\pawguard_ai\PawGuardAI

# Check connected devices
flutter devices

# Run on connected device
flutter run

# Run with verbose logging (for debugging)
flutter run -v

# Run in release mode (for performance testing)
flutter run --release
```

### Method 2: Using Android Studio

1. Open project in Android Studio
2. Select your device from the device dropdown
3. Click the **Run** button (green play icon)
4. Wait for app to build and install

### Method 3: Manual APK Installation

```bash
# Build APK
flutter build apk --debug

# Install manually
adb install build\app\outputs\flutter-apk\app-debug.apk

# Or for release build
flutter build apk --release
adb install build\app\outputs\flutter-apk\app-release.apk
```

---

## Testing AI Features

### 1. Model Loading Test

**Objective**: Verify all AI models load correctly

**Steps**:
1. Launch the app
2. Navigate to AI CCTV Camera screen
3. Check the Statistics panel (bottom-right)
4. Verify model status indicators:
   - ✅ Green = Model loaded successfully
   - ❌ Red = Model failed to load

**Expected Results**:
- Object Detection: ✅ (Model included in assets)
- Breed Classifier: ❌ (Model file not provided - expected)
- Activity Detector: ❌ (Model file not provided - expected)
- Health Monitor: ❌ (Model file not provided - expected)

**Note**: Models without files will use fallback implementations.

---

### 2. Real-Time Object Detection Test

**Objective**: Test object detection performance

**Prerequisites**:
- Good lighting conditions
- Pet or pet image available

**Steps**:
1. Open AI CCTV Camera screen
2. Ensure AI is enabled (toggle in top-right)
3. Point camera at a dog or cat
4. Watch for:
   - Bounding boxes around detected animals
   - Labels with confidence scores
   - FPS counter updates

**Performance Metrics to Monitor**:
- **FPS**: Should be >15 FPS for smooth experience
- **Latency**: Should be <200ms for real-time feel
- **Detection Count**: Should detect pets reliably

**Troubleshooting**:
- If FPS <10: Reduce resolution or increase frame skip rate
- If latency >300ms: Check device CPU usage
- If no detections: Ensure good lighting and clear view of pet

---

### 3. Breed Classification Test

**Objective**: Test breed detection (when model is loaded)

**Prerequisites**:
- `breed_classifier.tflite` model placed in `assets/models/`

**Steps**:
1. Open AI CCTV Camera screen
2. Point camera at a dog or cat
3. Wait for breed label to appear (top-left)
4. Verify:
   - Breed name is correct or reasonable
   - Confidence score is displayed
   - Label color matches species (orange=dog, purple=cat)

**Expected Behavior**:
- Breed detection updates every ~15 frames
- High confidence (>80%) shows "AI Verified" badge

---

### 4. Activity Detection Test

**Objective**: Verify activity recognition

**Prerequisites**:
- `activity_detector.tflite` model loaded

**Steps**:
1. Open AI CCTV Camera screen
2. Observe pet performing different activities:
   - Sitting
   - Standing
   - Walking
   - Running
   - Playing
   - Eating
   - Sleeping
3. Check activity label (top-right)
4. Verify label updates when activity changes

---

### 5. Health Assessment Test

**Objective**: Test visual health screening

**Prerequisites**:
- `health_detector.tflite` model loaded

**Steps**:
1. Capture clear, well-lit image of pet
2. Check health indicator (bottom-left)
3. Verify:
   - Health score percentage
   - Status color (green/orange/red)
   - Icon matches status

**Warning**: Health assessments are preliminary only and should not replace veterinary care.

---

### 6. Adoption Screen Test

**Objective**: Verify AI features in adoption listings

**Steps**:
1. Navigate to Adoption List screen
2. Observe pet cards display:
   - Breed badges
   - Health scores
   - Activity labels
   - AI verified badges (for high confidence)
3. Test filters:
   - Filter by species (Dog/Cat)
   - Filter by size
   - Filter by health status
   - Enable "AI Verified Only"
4. Verify filtered results update correctly

---

## Performance Benchmarking

### Using Built-in Performance Monitor

1. Navigate to AI CCTV Camera
2. Enable statistics panel
3. Run for 1-2 minutes
4. Record metrics:
   - Average FPS
   - Detection count
   - Processing latency

### Benchmark Different Scenarios

| Scenario | Expected FPS | Expected Latency |
|----------|-------------|------------------|
| Object detection only | 20-30 | <100ms |
| + Breed classification | 15-25 | <150ms |
| + All AI features | 10-20 | <200ms |
| Low-end device | 10-15 | <250ms |
| High-end device | 25-35 | <80ms |

---

## Common Issues & Solutions

### Issue: App Crashes on Launch
**Solutions**:
- Check Android version compatibility (min API 24)
- Clear app data: `adb shell pm clear com.example.pawguard_ai`
- Reinstall: `adb uninstall com.example.pawguard_ai && flutter run`

### Issue: Camera Permission Denied
**Solutions**:
- Manually grant permission in Settings > Apps > PawGuardAI > Permissions
- Uninstall and reinstall to trigger permission prompt

### Issue: Models Not Loading
**Solutions**:
- Verify model files exist in `assets/models/`
- Check `pubspec.yaml` includes model in assets
- Run `flutter clean && flutter pub get`
- Rebuild app

### Issue: Poor Performance
**Solutions**:
- Run in release mode: `flutter run --release`
- Close background apps
- Reduce camera resolution in `cctv_camera_screen.dart`
- Increase frame skip rate in object detector

### Issue: ADB Device Not Found
**Solutions**:
- Reconnect USB cable
- Revoke USB debugging and re-enable
- Try different USB port
- Update USB drivers (Windows)
- Run `adb kill-server && adb start-server`

---

## Exporting Test Results

### Screenshot Testing
```bash
# Capture screenshot
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# Record screen video (Android 4.4+)
adb shell screenrecord /sdcard/test.mp4
# Stop with Ctrl+C
adb pull /sdcard/test.mp4
```

### Logs Export
```bash
# Save Flutter logs
flutter run > test_log.txt 2>&1

# Save Android logcat
adb logcat > android_log.txt

# Filter for app logs only
adb logcat | grep "flutter"
```

---

## Performance Profiling

### Using Flutter DevTools

1. Run app in debug mode
2. Open DevTools:
   ```bash
   flutter run
   # Press 'v' in terminal to open DevTools in browser
   ```
3. Navigate to Performance tab
4. Record timeline during AI operations
5. Analyze frame rendering times

### Memory Profiling

1. Open DevTools Memory tab
2. Take snapshot before AI operations
3. Run AI features for 1-2 minutes
4. Take another snapshot
5. Compare memory usage

---

## Recommended Test Devices

### Minimum Spec Device
- **Example**: Samsung Galaxy A10
- **Purpose**: Ensure app works on low-end devices
- **Expected**: 10-15 FPS with AI

### Mid-Range Device
- **Example**: Samsung Galaxy A52
- **Purpose**: Typical user experience
- **Expected**: 20-25 FPS with AI

### High-End Device
- **Example**: Samsung Galaxy S21
- **Purpose**: Optimal performance showcase
- **Expected**: 30+ FPS with AI

---

## Test Report Template

```
=== PawGuardAI Device Test Report ===

Device Information:
- Model: [Device Name]
- Android Version: [e.g., Android 12]
- RAM: [e.g., 4GB]
- Processor: [e.g., Snapdragon 720G]

Test Results:
- Object Detection: [PASS/FAIL]
  - FPS: [value]
  - Latency: [value]ms

- Breed Classification: [PASS/FAIL/SKIPPED]
  - Accuracy: [Good/Fair/Poor]
  
- Activity Detection: [PASS/FAIL/SKIPPED]
  
- Health Assessment: [PASS/FAIL/SKIPPED]

- Adoption List: [PASS/FAIL]
  - Filters working: [YES/NO]
  - Cards rendering: [YES/NO]

Performance Summary:
- Overall FPS: [value]
- Memory Usage: [value]MB
- Battery Drain: [High/Medium/Low]

Issues Encountered:
[List any issues]

Recommendations:
[Any suggestions]
```

---

## Next Steps After Testing

1. **Document Results**: Fill out test report template
2. **Optimize If Needed**: Adjust frame skip rates, resolution
3. **Add Models**: Place TFLite models in assets for full functionality
4. **User Testing**: Have others test on different devices
5. **Production Build**: Create release APK when ready

---

## Support

For technical issues:
1. Check console logs for error messages
2. Review `DEBUGGING_DOCUMENTATION.txt` in project root
3. Test with minimal features enabled first
4. Gradually enable AI features to isolate issues

**Happy Testing! 🐾**
