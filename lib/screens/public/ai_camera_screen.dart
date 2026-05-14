import 'dart:async';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../models/ai_detection_result.dart';
import '../../models/breed_info.dart';
import '../../models/activity_result.dart';
import '../../services/object_detector.dart';
import '../../services/breed_classifier.dart';
import '../../services/activity_detector.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/bounding_box_painter.dart';
import '../../widgets/detection_overlay.dart';

enum AIMode {
  detection,
  breed,
  activity,
}

class AICameraScreen extends StatefulWidget {
  const AICameraScreen({super.key});

  @override
  State<AICameraScreen> createState() => _AICameraScreenState();
}

class _AICameraScreenState extends State<AICameraScreen> {
  CameraController? _cameraController;
  final ObjectDetectorService _detector = ObjectDetectorService();
  final BreedClassifierService _breedClassifier = BreedClassifierService();
  final ActivityDetectorService _activityDetector = ActivityDetectorService();

  List<CameraDescription>? _cameras;
  List<AIDetectionResult> _detections = [];
  BreedInfo? _currentBreed;
  ActivityResult? _currentActivity;

  bool _isInitialized = false;
  bool _isDetecting = false;
  AIMode _currentMode = AIMode.detection;
  int _frameCount = 0;
  DateTime _lastFrameTime = DateTime.now();
  double _fps = 0.0;

  @override
  void initState() {
    super.initState();
    _initializeAll();
  }

  Future<void> _initializeAll() async {
    try {
      // Request camera permission
      final status = await Permission.camera.request();
      if (!status.isGranted) {
        debugPrint('Camera permission denied');
        return;
      }

      // Load AI models
      await Future.wait([
        _detector.loadModel(),
        _breedClassifier.loadModel(),
        _activityDetector.loadModel(),
      ]);

      // Initialize camera
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _cameraController = CameraController(
          _cameras!.first,
          ResolutionPreset.medium,
          enableAudio: false,
        );

        await _cameraController!.initialize();
        await _cameraController!.startImageStream(_processCameraImage);

        if (mounted) {
          setState(() => _isInitialized = true);
        }
      }
    } catch (e) {
      debugPrint('Initialization error: $e');
    }
  }

  Future<void> _processCameraImage(CameraImage image) async {
    if (_isDetecting || !_isInitialized) return;

    _isDetecting = true;

    try {
      // Calculate FPS
      _frameCount++;
      final now = DateTime.now();
      if (now.difference(_lastFrameTime).inSeconds >= 1) {
        setState(() {
          _fps = _frameCount / now.difference(_lastFrameTime).inSeconds;
          _frameCount = 0;
          _lastFrameTime = now;
        });
      }

      // Perform detection based on current mode
      switch (_currentMode) {
        case AIMode.detection:
          final detections = await _detector.detectFromCameraImage(
            image,
            _cameraController!.value.previewSize!.width.toInt(),
            _cameraController!.value.previewSize!.height.toInt(),
          );
          if (detections.isNotEmpty && mounted) {
            setState(() => _detections = detections);
          }
          break;

        case AIMode.breed:
        case AIMode.activity:
          // These modes process less frequently
          break;
      }
    } catch (e) {
      debugPrint('Detection error: $e');
    } finally {
      _isDetecting = false;
    }
  }

  void _switchMode(AIMode mode) {
    setState(() {
      _currentMode = mode;
      _detections = [];
      _currentBreed = null;
      _currentActivity = null;
    });
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _detector.dispose();
    _breedClassifier.dispose();
    _activityDetector.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized || _cameraController == null) {
      return Scaffold(
        appBar: CustomAppBar(
          title: 'AI Camera',
          leadingIcon: Icons.camera_alt,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: 'AI Camera',
        leadingIcon: Icons.camera_alt,
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Camera Preview
          CameraPreview(_cameraController!),

          // Bounding Boxes (detection mode)
          if (_currentMode == AIMode.detection && _detections.isNotEmpty)
            BoundingBoxOverlay(
              detections: _detections,
              imageSize: _cameraController!.value.previewSize ?? const Size(1, 1),
              child: Container(),
            ),

          // Detection Overlay
          DetectionOverlay(
            detections: _detections,
            fps: _fps,
            showFps: true,
            showStats: _currentMode == AIMode.detection,
          ),

          // Mode Selector
          Positioned(
            top: 16,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildModeChip(
                  label: 'Detection',
                  icon: Icons.visibility,
                  mode: AIMode.detection,
                ),
                const SizedBox(width: 8),
                _buildModeChip(
                  label: 'Breed',
                  icon: Icons.pets,
                  mode: AIMode.breed,
                ),
                const SizedBox(width: 8),
                _buildModeChip(
                  label: 'Activity',
                  icon: Icons.directions_run,
                  mode: AIMode.activity,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModeChip({
    required String label,
    required IconData icon,
    required AIMode mode,
  }) {
    final isActive = _currentMode == mode;

    return GestureDetector(
      onTap: () => _switchMode(mode),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? Colors.blue : Colors.black.withOpacity(0.6),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive ? Colors.white : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: Colors.white),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
