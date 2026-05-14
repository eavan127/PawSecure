# PawGuard AI 🐾

AI-powered disaster-ready animal identity, rescue, and adoption platform.

## Tech Stack

- **Flutter** - Cross-platform mobile framework
- **Firebase** (Firestore, Auth) - Backend and authentication
- **TensorFlow Lite** - On-device AI inference
- **Google Cloud Vision** - Additional AI capabilities
- **Google Maps** - Location services
- **Gemini AI** - Advanced AI features

## AI Features

### 🤖 Real-Time Object Detection
- Detects dogs and cats in camera feed
- Bounding boxes with confidence scores
- Real-time performance (15-30 FPS)

### 🐕 Breed Classification
- Identifies 70+ dog and cat breeds
- Confidence-based verification
- Breed characteristics and temperament info

### 🏃 Activity Recognition
- Tracks 7 pet activities (sitting, walking, running, playing, eating, sleeping, standing)
- Session-based activity logging
- Activity history analysis

### 💚 Health Monitoring
- Visual health screening
- Skin condition assessment
- Early warning indicators
- Veterinary follow-up recommendations

### 🎯 Smart Adoption
- AI-powered breed detection in listings
- Health assessment badges
- Activity level indicators
- Smart filtering by breed, size, health, and AI confidence

## Status

🚧 MVP with AI enhancements - Ready for device testing

## Getting Started

### Prerequisites
- Flutter SDK (latest stable)
- Android Studio or VS Code with Flutter
- Android device (API 24+) or emulator

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd pawguard_ai/PawGuardAI

# Install dependencies
flutter pub get

# Run the app
flutter run
```

## AI Model Setup

The app includes one pre-configured model (`ssd_mobilenet_v2.tflite`) and supports four additional models for enhanced features.

### Quick Start (Works Out of Box)
The app runs with object detection only. Additional AI features use fallback implementations.

### Full AI Setup (Recommended)
To enable all AI features, add these models to `assets/models/`:

1. **breed_classifier.tflite** (10-15 MB) - Breed identification
2. **activity_detector.tflite** (8-12 MB) - Activity recognition
3. **health_detector.tflite** (12-18 MB) - Health screening
4. **pet_feature_extractor.tflite** (8-10 MB) - Similarity matching

**See [assets/models/model_download_guide.md](assets/models/model_download_guide.md) for detailed instructions.**

## Testing on Device

See [DEVICE_TEST_GUIDE.md](DEVICE_TEST_GUIDE.md) for comprehensive testing instructions including:
- Android device setup
- Performance benchmarking
- AI feature testing
- Troubleshooting guide

## Project Structure

```
lib/
├── models/           # Data models
├── screens/          # UI screens
│   ├── auth/        # Authentication
│   ├── public/      # Public-facing screens
│   └── ngo/         # NGO-specific screens
├── services/         # AI services and Firebase
├── widgets/          # Reusable UI components
└── utils/           # Utilities and helpers

assets/
├── models/          # TFLite models
└── *.tflite        # Model files
```

## Key Features

- ✅ Real-time AI object detection
- ✅ Breed classification with 70+ breeds
- ✅ Activity recognition and tracking
- ✅ Visual health assessment
- ✅ Smart adoption filtering
- ✅ CCTV camera monitoring
- ✅ Performance monitoring tools
- ⏳ Firebase integration (in progress)
- ⏳ Cloud deployment (planned)

## Performance

- **FPS**: 15-30 (device dependent)
- **Inference Time**: <200ms average
- **Memory Usage**: ~50-100MB
- **Battery Impact**: Moderate (optimizations ongoing)

## Contributing

1. Fork the repository
2. Create feature branch
3. Test on physical device
4. Submit pull request

## License

[License information]

## Support

For issues or questions:
1. Check [DEVICE_TEST_GUIDE.md](DEVICE_TEST_GUIDE.md)
2. Review [DEBUGGING_DOCUMENTATION.txt](DEBUGGING_DOCUMENTATION.txt)
3. Create an issue with device specs and logs
