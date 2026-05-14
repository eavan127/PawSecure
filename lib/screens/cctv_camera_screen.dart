import 'dart:io';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:image/image.dart' as img;
import 'package:permission_handler/permission_handler.dart';
import '../services/object_detector.dart';
import '../services/breed_classifier.dart';
import '../services/activity_detector.dart';
import '../services/health_monitor.dart';
import '../models/ai_detection_result.dart';
import '../models/breed_info.dart';
import '../models/activity_result.dart';
import '../models/health_assessment.dart';
import '../widgets/ai_overlay_widget.dart';
import '../widgets/detection_stats_widget.dart';

class CctvCameraScreen extends StatefulWidget {
  const CctvCameraScreen({super.key});

  @override
  State<CctvCameraScreen> createState() => _CctvCameraScreenState();
}

class _CctvCameraScreenState extends State<CctvCameraScreen> {
  // Camera
  CameraController? _controller;
  late FaceDetector _faceDetector;

  // AI Services
  final _objectDetector = ObjectDetectorService();
  final _breedClassifier = BreedClassifierService();
  final _activityDetector = ActivityDetectorService();
  final _healthMonitor = HealthMonitorService();

  // AI Results
  List<AIDetectionResult> _detections = [];
  BreedInfo? _currentBreedInfo;
  ActivityResult? _currentActivity;
  HealthAssessment? _currentHealth;

  // Processing state
  bool _isProcessing = false;
  Timer? _aiProcessingTimer;

  // Statistics
  int _fps = 0;
  int _frameCount = 0;
  DateTime? _lastFpsUpdate;
  Duration _processingLatency = Duration.zero;

  // UI state
  bool _showStats = true;
  bool _showOverlay = true;
  bool _aiEnabled = true;

  @override
  void initState() {
    super.initState();
    _initCamera();
    _initAIServices();
    _faceDetector = FaceDetector(
      options: FaceDetectorOptions(enableContours: false),
    );
  }

  Future<void> _initCamera() async {
    // Request camera permission
    final status = await Permission.camera.request();

    if (!status.isGranted) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Camera permission is required to use this feature'),
            duration: Duration(seconds: 3),
          ),
        );
      }
      return;
    }

    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        debugPrint('No cameras available');
        return;
      }

      _controller = CameraController(
        cameras.first,
        ResolutionPreset.medium,
        enableAudio: false,
      );
      await _controller!.initialize();

      // Start streaming for real-time AI
      if (_aiEnabled) {
        _controller!.startImageStream(_processCameraImage);
      }

      if (mounted) {
        setState(() {});
      }
    } catch (e) {
      debugPrint('Error initializing camera: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to initialize camera: $e')),
        );
      }
    }
  }

  Future<void> _initAIServices() async {
    try {
      await Future.wait([
        _objectDetector.loadModel(),
        _breedClassifier.loadModel(),
        _activityDetector.loadModel(),
        _healthMonitor.loadModel(),
      ]);
      debugPrint('✅ All AI services initialized');
    } catch (e) {
      debugPrint('⚠️ Some AI services failed to load: $e');
    }
  }

  // Process camera image stream for real-time AI
  Future<void> _processCameraImage(CameraImage image) async {
    if (_isProcessing || !_aiEnabled) return;

    _isProcessing = true;
    final startTime = DateTime.now();

    try {
      // Update FPS
      _updateFPS();

      // Get camera image size
      final imageWidth = image.width;
      final imageHeight = image.height;

      // Run object detection
      final detections = await _objectDetector.detectFromCameraImage(
        image,
        imageWidth,
        imageHeight,
      );

      if (detections.isNotEmpty && mounted) {
        setState(() {
          _detections = detections;
        });

        // Run additional AI on detected pets (less frequently)
        if (_frameCount % 15 == 0) {
          _runAdditionalAI();
        }
      }

      // Calculate latency
      _processingLatency = DateTime.now().difference(startTime);
    } catch (e) {
      debugPrint('Error processing camera image: $e');
    } finally {
      _isProcessing = false;
    }
  }

  void _updateFPS() {
    _frameCount++;
    final now = DateTime.now();

    if (_lastFpsUpdate == null) {
      _lastFpsUpdate = now;
    } else {
      final elapsed = now.difference(_lastFpsUpdate!);
      if (elapsed.inSeconds >= 1) {
        if (mounted) {
          setState(() {
            _fps = _frameCount;
          });
        }
        _frameCount = 0;
        _lastFpsUpdate = now;
      }
    }
  }

  Future<void> _runAdditionalAI() async {
    // Capture current frame for additional AI processing
    if (_controller == null) return;

    try {
      final xFile = await _controller!.takePicture();
      final imageFile = File(xFile.path);
      final imageBytes = await imageFile.readAsBytes();

      // Run breed classification
      final breedInfo = await _breedClassifier.classifyBreedFromBytes(imageBytes);
      if (breedInfo != null && mounted) {
        setState(() => _currentBreedInfo = breedInfo);
      }

      // Run activity detection
      final activityResult = await _activityDetector.detectActivityFromBytes(imageBytes);
      if (activityResult != null && mounted) {
        setState(() => _currentActivity = activityResult);
      }

      // Run health assessment
      final healthResult = await _healthMonitor.assessHealthFromBytes(imageBytes);
      if (healthResult != null && mounted) {
        setState(() => _currentHealth = healthResult);
      }

      // Clean up temp file
      await imageFile.delete();
    } catch (e) {
      debugPrint('Error running additional AI: $e');
    }
  }

  @override
  void dispose() {
    _controller?.stopImageStream();
    _controller?.dispose();
    _faceDetector.close();
    _aiProcessingTimer?.cancel();
    _activityDetector.endCurrentSession();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_controller == null || !_controller!.value.isInitialized) {
      return Scaffold(
        appBar: AppBar(title: const Text('AI CCTV Camera')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final size = MediaQuery.of(context).size;
    final deviceRatio = size.width / size.height;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI CCTV Camera'),
        actions: [
          IconButton(
            icon: Icon(_showOverlay ? Icons.visibility : Icons.visibility_off),
            onPressed: () => setState(() => _showOverlay = !_showOverlay),
            tooltip: 'Toggle AI Overlay',
          ),
          IconButton(
            icon: Icon(_showStats ? Icons.analytics : Icons.analytics_outlined),
            onPressed: () => setState(() => _showStats = !_showStats),
            tooltip: 'Toggle Statistics',
          ),
          IconButton(
            icon: Icon(_aiEnabled ? Icons.psychology : Icons.psychology_outlined),
            onPressed: _toggleAI,
            tooltip: 'Toggle AI Processing',
          ),
        ],
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Camera Preview
          Transform.scale(
            scale: _controller!.value.aspectRatio / deviceRatio,
            child: Center(
              child: AspectRatio(
                aspectRatio: _controller!.value.aspectRatio,
                child: CameraPreview(_controller!),
              ),
            ),
          ),

          // AI Overlay
          if (_showOverlay && _aiEnabled)
            AIOverlayWidget(
              imageSize: size,
              objectDetections: _detections,
              breedInfo: _currentBreedInfo,
              activityResult: _currentActivity,
              healthAssessment: _currentHealth,
            ),

          // Statistics Panel
          if (_showStats)
            Positioned(
              bottom: 20,
              right: 12,
              child: DetectionStatsWidget(
                fps: _fps,
                detectionCount: _detections.length,
                processingLatency: _processingLatency,
                modelLoaded: _objectDetector.isInitialized,
                modelStatus: {
                  'Object Detection': _objectDetector.isInitialized,
                  'Breed Classifier': _breedClassifier.isInitialized,
                  'Activity Detector': _activityDetector.isInitialized,
                  'Health Monitor': _healthMonitor.isInitialized,
                },
              ),
            ),

          // AI Status Indicator
          if (!_aiEnabled)
            Positioned(
              top: 20,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'AI DISABLED',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _toggleAI() {
    setState(() {
      _aiEnabled = !_aiEnabled;

      if (_aiEnabled && _controller != null) {
        _controller!.startImageStream(_processCameraImage);
      } else if (_controller != null) {
        _controller!.stopImageStream();
        _detections = [];
        _currentBreedInfo = null;
        _currentActivity = null;
        _currentHealth = null;
      }
    });
  }
}
```
