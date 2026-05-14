import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/object_detector.dart';
import '../models/ai_detection_result.dart';

class TestDetectorScreen extends StatefulWidget {
  const TestDetectorScreen({super.key});

  @override
  State<TestDetectorScreen> createState() => _TestDetectorScreenState();
}

class _TestDetectorScreenState extends State<TestDetectorScreen> {
  final ObjectDetectorService _detector = ObjectDetectorService();
  final ImagePicker _picker = ImagePicker();
  
  bool _isLoading = true;
  String _status = 'Initializing...';
  List<AIDetectionResult> _detections = [];
  
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  File? _pickedImage;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _initializeAll();
  }

  Future<void> _initializeAll() async {
    setState(() {
      _status = 'Loading model...';
      _isLoading = true;
    });
    
    try {
      // Load the detector model
      debugPrint('Initializing model...');
      await _detector.loadModel();
      debugPrint('Model initialized successfully');
      
      setState(() => _status = 'Model loaded! Requesting camera permission...');

      // Request camera permission
      final permissionStatus = await Permission.camera.request();
      
      if (!permissionStatus.isGranted) {
        debugPrint('Camera permission denied');
        if (mounted) {
          setState(() => _status = 'Camera permission denied. Pick an image to test.');
        }
        return;
      }

      setState(() => _status = 'Permission granted! Initializing camera...');

      try {
        _cameras = await availableCameras();
        if (_cameras != null && _cameras!.isNotEmpty) {
          _cameraController = CameraController(
            _cameras!.first,
            ResolutionPreset.medium,
            enableAudio: false,
          );
          await _cameraController!.initialize();
          if (mounted) {
            setState(() {
              _status = 'Camera ready! Tap capture button or pick an image';
            });
          }
        } else {
          setState(() => _status = 'No camera found. Pick an image to test.');
        }
      } catch (e) {
        debugPrint('Camera init error: $e');
        setState(() => _status = 'Camera unavailable: $e. Pick an image to test.');
      }
    } catch (e) {
      debugPrint('Model load error: $e');
      setState(() => _status = 'Error loading model: $e. Try restarting.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        setState(() {
          _pickedImage = File(image.path);
          _detections = [];
          _status = 'Image selected. Analyzing...';
        });
        
        // Slight delay to ensure UI updates
        await Future.delayed(const Duration(milliseconds: 100));
        await _runDetection(_pickedImage!);
      }
    } catch (e) {
      setState(() => _status = 'Error picking image: $e');
    }
  }

  Future<void> _captureAndDetect() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      _pickImage();
      return;
    }

    if (_isProcessing) return;
    setState(() {
      _isProcessing = true;
      _status = 'Capturing...';
    });

    try {
      final XFile photo = await _cameraController!.takePicture();
      final imageFile = File(photo.path);
      await _runDetection(imageFile);
    } catch (e) {
      setState(() {
        _status = 'Capture error: $e';
        _isProcessing = false;
      });
    }
  }

  Future<void> _runDetection(File imageFile) async {
    if (!_detector.isInitialized) {
      setState(() {
        _status = 'Model not ready. Retrying init...';
      });
      try {
        await _detector.loadModel();
      } catch (e) {
        setState(() {
          _status = 'Failed to load model: $e';
          _isProcessing = false;
        });
        return;
      }
    }

    setState(() {
      _isProcessing = true;
      _status = 'Analyzing...';
    });

    try {
      final results = _detector.detect(imageFile);
      setState(() {
        _detections = results;
        _status = 'Found ${results.length} object(s)';
        _isProcessing = false;
      });
    } catch (e) {
      debugPrint('Detection error: $e');
      setState(() {
        _status = 'Detection error: $e';
        _isProcessing = false;
      });
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _detector.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🐾 PawGuard AI - Test'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.image),
            onPressed: _pickImage,
            tooltip: 'Pick Image',
          ),
        ],
      ),
      body: Column(
        children: [
          // Status bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            color: Colors.deepPurple.shade100,
            child: Text(
              _status,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
            ),
          ),

          // Main View (Camera or Picked Image)
          Expanded(
            flex: 2,
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _pickedImage != null
                    ? Image.file(_pickedImage!, fit: BoxFit.contain)
                    : _cameraController != null && _cameraController!.value.isInitialized
                        ? CameraPreview(_cameraController!)
                        : Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.broken_image, size: 64, color: Colors.grey),
                                const SizedBox(height: 16),
                                const Text(
                                  'Camera Not Available',
                                  style: TextStyle(fontSize: 18, color: Colors.grey),
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  onPressed: _pickImage,
                                  icon: const Icon(Icons.upload_file),
                                  label: const Text('Pick Image to Test'),
                                ),
                              ],
                            ),
                          ),
          ),

          // Detection Results
          Expanded(
            flex: 1,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              color: Colors.grey.shade100,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Detected Objects:',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      if (_detections.isNotEmpty)
                        Chip(
                          label: Text('${_detections.length}'),
                          backgroundColor: Colors.deepPurple.shade100,
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: _detections.isEmpty
                        ? const Center(child: Text('No detections yet'))
                        : ListView.builder(
                            itemCount: _detections.length,
                            itemBuilder: (context, index) {
                              final det = _detections[index];
                              return Card(
                                child: ListTile(
                                  leading: const Icon(Icons.pets, color: Colors.deepPurple),
                                  title: Text(det.label),
                                  subtitle: Text(
                                    'Confidence: ${(det.confidence * 100).toStringAsFixed(1)}%',
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isProcessing ? null : _captureAndDetect,
        backgroundColor: Colors.deepPurple,
        icon: Icon(_isProcessing ? Icons.hourglass_empty : 
                   (_pickedImage != null ? Icons.refresh : Icons.camera)),
        label: Text(_isProcessing ? 'Processing' : 
                   (_pickedImage != null ? 'Retest Image' : 'Capture')),
      ),
    );
  }
}
