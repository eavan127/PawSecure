import 'dart:io';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import '../models/ai_detection_result.dart';

class ObjectDetectorService {
  late Interpreter _interpreter;
  late List<String> _labels;
  bool _isInitialized = false;
  bool _isProcessing = false;
  int _frameSkipCounter = 0;
  int _frameSkipRate = 3; // Process every 3rd frame

  bool get isInitialized => _isInitialized;
  bool get isProcessing => _isProcessing;
  
  /// Set frame skip rate (higher = better performance, lower accuracy)
  set frameSkipRate(int rate) => _frameSkipRate = rate.clamp(1, 10);

  /// Load the TFLite model and labels
  Future<void> loadModel() async {
    try {
      // Load the interpreter from asset
      _interpreter = await Interpreter.fromAsset(
        'assets/ssd_mobilenet_v2.tflite',
        options: InterpreterOptions()..threads = 4,
      );

      // Load labels from assets
      final labelsData = await rootBundle.loadString('assets/labels.txt');
      _labels = labelsData
          .split('\n')
          .where((line) => line.trim().isNotEmpty)
          .toList();

      _isInitialized = true;
      debugPrint('✅ Model loaded successfully!');
      debugPrint('📋 Labels loaded: ${_labels.length} classes');
    } catch (e) {
      debugPrint('❌ Error loading model: $e');
      rethrow;
    }
  }

  /// Detect objects in an image file (returns new AIDetectionResult format)
  List<AIDetectionResult> detect(File imageFile, {int imageWidth = 300, int imageHeight = 300}) {
    if (!_isInitialized) {
      throw Exception('Model not initialized. Call loadModel() first.');
    }

    final image = img.decodeImage(imageFile.readAsBytesSync());
    if (image == null) {
      throw Exception('Failed to decode image');
    }

    return _detectFromImage(image, imageWidth, imageHeight);
  }

  /// Detect objects from decoded image (internal)
  List<AIDetectionResult> _detectFromImage(img.Image image, int targetWidth, int targetHeight) {
    final resized = img.copyResize(image, width: 300, height: 300);
    final inputBuffer = _imageToByteBuffer(resized);

    // Prepare output buffers
    final outputLocations = List.generate(1, (_) => List.generate(10, (_) => List.filled(4, 0.0)));
    final outputClasses = List.generate(1, (_) => List.filled(10, 0.0));
    final outputScores = List.generate(1, (_) => List.filled(10, 0.0));
    final numDetections = List.filled(1, 0.0);

    final outputs = <int, Object>{
      0: outputLocations,
      1: outputClasses,
      2: outputScores,
      3: numDetections,
    };

    _interpreter.runForMultipleInputs([inputBuffer], outputs);

    // Parse results into AIDetectionResult
    List<AIDetectionResult> detections = [];

    final numDetected = numDetections[0].toInt();
    for (int i = 0; i < numDetected && i < 10; i++) {
      final score = outputScores[0][i];
      if (score > 0.5) {
        final classIndex = outputClasses[0][i].toInt();
        final label = classIndex < _labels.length ? _labels[classIndex] : 'Unknown';
        
        // Convert box coordinates [top, left, bottom, right] normalized values
        final boxCoords = outputLocations[0][i];
        final box = BoundingBox(
          top: boxCoords[0] * targetHeight,
          left: boxCoords[1] * targetWidth,
          bottom: boxCoords[2] * targetHeight,
          right: boxCoords[3] * targetWidth,
        );
        
        detections.add(AIDetectionResult(
          label: label,
          confidence: score,
          box: box,
        ));
      }
    }

    return detections;
  }

  /// Detect objects from raw image bytes (useful for camera frames)
  List<AIDetectionResult> detectFromBytes(Uint8List bytes, {int imageWidth = 300, int imageHeight = 300}) {
    if (!_isInitialized) {
      throw Exception('Model not initialized. Call loadModel() first.');
    }

    final image = img.decodeImage(bytes);
    if (image == null) {
      throw Exception('Failed to decode image bytes');
    }

    return _detectFromImage(image, imageWidth, imageHeight);
  }

  /// Real-time detection from camera image with frame skipping
  Future<List<AIDetectionResult>> detectFromCameraImage(
    CameraImage cameraImage,
    int imageWidth,
    int imageHeight,
  ) async {
    if (!_isInitialized || _isProcessing) {
      return [];
    }

    // Frame skipping for performance
    _frameSkipCounter++;
    if (_frameSkipCounter < _frameSkipRate) {
      return [];
    }
    _frameSkipCounter = 0;

    _isProcessing = true;

    try {
      // Convert CameraImage to img.Image
      final image = _convertCameraImage(cameraImage);
      if (image == null) {
        return [];
      }

      final detections = _detectFromImage(image, imageWidth, imageHeight);
      return detections;
    } catch (e) {
      debugPrint('❌ Real-time detection error: $e');
      return [];
    } finally {
      _isProcessing = false;
    }
  }

  /// Filter detections to only include pets (dogs and cats)
  List<AIDetectionResult> filterPets(List<AIDetectionResult> detections) {
    return detections.where((d) => d.isPet).toList();
  }

  /// Convert CameraImage to img.Image
  img.Image? _convertCameraImage(CameraImage cameraImage) {
    try {
      if (cameraImage.format.group == ImageFormatGroup.yuv420) {
        return _convertYUV420(cameraImage);
      } else if (cameraImage.format.group == ImageFormatGroup.bgra8888) {
        return _convertBGRA8888(cameraImage);
      }
      return null;
    } catch (e) {
      debugPrint('❌ Error converting camera image: $e');
      return null;
    }
  }

  /// Convert YUV420 to RGB
  img.Image _convertYUV420(CameraImage cameraImage) {
    final width = cameraImage.width;
    final height = cameraImage.height;
    final yPlane = cameraImage.planes[0];
    final uPlane = cameraImage.planes[1];
    final vPlane = cameraImage.planes[2];

    final image = img.Image(width: width, height: height);

    for (int h = 0; h < height; h++) {
      for (int w = 0; w < width; w++) {
        final yIndex = h * yPlane.bytesPerRow + w;
        final uvIndex = (h ~/ 2) * uPlane.bytesPerRow + (w ~/ 2);

        final y = yPlane.bytes[yIndex];
        final u = uPlane.bytes[uvIndex];
        final v = vPlane.bytes[uvIndex];

        // YUV to RGB conversion
        int r = (y + v * 1436 / 1024 - 179).round().clamp(0, 255);
        int g = (y - u * 46549 / 131072 + 44 - v * 93604 / 131072 + 91).round().clamp(0, 255);
        int b = (y + u * 1814 / 1024 - 227).round().clamp(0, 255);

        image.setPixelRgb(w, h, r, g, b);
      }
    }

    return image;
  }

  /// Convert BGRA8888 to RGB
  img.Image _convertBGRA8888(CameraImage cameraImage) {
    final width = cameraImage.width;
    final height = cameraImage.height;
    final bytes = cameraImage.planes[0].bytes;

    final image = img.Image(width: width, height: height);

    for (int h = 0; h < height; h++) {
      for (int w = 0; w < width; w++) {
        final index = h * width + w;
        final b = bytes[index * 4];
        final g = bytes[index * 4 + 1];
        final r = bytes[index * 4 + 2];

        image.setPixelRgb(w, h, r, g, b);
      }
    }

    return image;
  }

  /// Convert image to uint8 buffer for model input
  List<List<List<List<int>>>> _imageToByteBuffer(img.Image image) {
    // Create 4D tensor: [1, 300, 300, 3] with uint8 values (0-255)
    return List.generate(1, (_) {
      return List.generate(300, (y) {
        return List.generate(300, (x) {
          final pixel = image.getPixel(x, y);
          // Return uint8 values (0-255) - NO normalization
          return [
            pixel.r.toInt(),
            pixel.g.toInt(),
            pixel.b.toInt(),
          ];
        });
      });
    });
  }

  /// Dispose resources
  void dispose() {
    if (_isInitialized) {
      _interpreter.close();
      _isInitialized = false;
    }
  }
}
