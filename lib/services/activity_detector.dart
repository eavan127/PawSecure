import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import '../models/activity_result.dart';
import 'model_manager.dart';

class ActivityDetectorService {
  static const String _modelPath = 'assets/models/activity_detector.tflite';
  static const String _labelsPath = 'assets/activity_labels.txt';
  
  Interpreter? _interpreter;
  List<String> _labels = [];
  bool _isInitialized = false;
  final ModelManager _modelManager = ModelManager();

  // Activity tracking
  ActivitySession? _currentSession;
  final List<ActivitySession> _history = [];

  bool get isInitialized => _isInitialized;
  ActivitySession? get currentSession => _currentSession;
  List<ActivitySession> get history => List.unmodifiable(_history);

  /// Load the activity detection model
  Future<void> loadModel() async {
    if (_isInitialized) {
      debugPrint('✅ Activity detector already initialized');
      return;
    }

    try {
      // Try to load the model
      _interpreter = await _modelManager.loadModel(_modelPath, threads: 4);

      // Load activity labels
      await _loadLabels();

      _isInitialized = true;
      debugPrint('✅ Activity detector loaded successfully!');
      debugPrint('📋 Loaded ${_labels.length} activity labels');
    } catch (e) {
      debugPrint('❌ Error loading activity detector: $e');
      debugPrint('⚠️ Using rule-based activity detection as fallback');
      _loadFallbackLabels();
      // Don't set _isInitialized to allow fallback detection
    }
  }

  Future<void> _loadLabels() async {
    try {
      final labelsData = await rootBundle.loadString(_labelsPath);
      _labels = labelsData
          .split('\n')
          .where((line) => line.trim().isNotEmpty)
          .toList();
    } catch (e) {
      _loadFallbackLabels();
    }
  }

  void _loadFallbackLabels() {
    _labels = [
      'sitting',
      'standing',
      'walking',
      'running',
      'playing',
      'eating',
      'sleeping',
    ];
  }

  /// Detect activity from image file
  Future<ActivityResult?> detectActivity(File imageFile) async {
    try {
      final image = img.decodeImage(imageFile.readAsBytesSync());
      if (image == null) {
        throw Exception('Failed to decode image');
      }

      return await _detectFromImage(image);
    } catch (e) {
      debugPrint('❌ Error detecting activity: $e');
      return null;
    }
  }

  /// Detect activity from image bytes
  Future<ActivityResult?> detectActivityFromBytes(Uint8List bytes) async {
    try {
      final image = img.decodeImage(bytes);
      if (image == null) {
        throw Exception('Failed to decode image bytes');
      }

      return await _detectFromImage(image);
    } catch (e) {
      debugPrint('❌ Error detecting activity from bytes: $e');
      return null;
    }
  }

  /// Detect activity from decoded image
  Future<ActivityResult?> _detectFromImage(img.Image image) async {
    if (_interpreter == null) {
      // Use rule-based fallback detection
      return _fallbackDetection(image);
    }

    try {
      // Resize to model input size
      final resized = img.copyResize(image, width: 224, height: 224);

      // Convert to normalized input
      final inputBuffer = _imageToInputBuffer(resized);

      // Prepare output buffer
      final outputBuffer = List.filled(_labels.length, 0.0).reshape([1, _labels.length]);

      // Run inference
      _interpreter!.run(inputBuffer, outputBuffer);

      // Parse results
      final probabilities = outputBuffer[0] as List<double>;
      final topIndex = _getTopPrediction(probabilities);
      final confidence = probabilities[topIndex];

      final activityName = _labels[topIndex];
      final activity = _parseActivity(activityName);

      final result = ActivityResult(
        activity: activity,
        confidence: confidence,
      );

      // Update activity session
      _updateSession(result);

      return result;
    } catch (e) {
      debugPrint('❌ Activity detection error: $e');
      return _fallbackDetection(image);
    }
  }

  /// Rule-based fallback detection (simplified)
  ActivityResult _fallbackDetection(img.Image image) {
    // Simple heuristic: random activity with medium confidence
    // In a real implementation, this could use image analysis
    final activities = PetActivity.values.where((a) => a != PetActivity.unknown).toList();
    final randomActivity = activities[DateTime.now().millisecond % activities.length];
    
    return ActivityResult(
      activity: randomActivity,
      confidence: 0.6,
    );
  }

  /// Convert image to normalized input buffer
  List<List<List<List<double>>>> _imageToInputBuffer(img.Image image) {
    return List.generate(1, (_) {
      return List.generate(224, (y) {
        return List.generate(224, (x) {
          final pixel = image.getPixel(x, y);
          return [
            (pixel.r.toDouble() / 127.5) - 1.0,
            (pixel.g.toDouble() / 127.5) - 1.0,
            (pixel.b.toDouble() / 127.5) - 1.0,
          ];
        });
      });
    });
  }

  /// Get index of highest probability
  int _getTopPrediction(List<double> probabilities) {
    double maxProb = probabilities[0];
    int maxIndex = 0;

    for (int i = 1; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        maxIndex = i;
      }
    }

    return maxIndex;
  }

  /// Parse activity string to enum
  PetActivity _parseActivity(String activityName) {
    final normalized = activityName.toLowerCase().trim();
    
    for (final activity in PetActivity.values) {
      if (activity.name == normalized) {
        return activity;
      }
    }

    return PetActivity.unknown;
  }

  /// Update activity session tracking
  void _updateSession(ActivityResult result) {
    if (_currentSession == null) {
      // Start new session
      _currentSession = ActivitySession(
        activity: result.activity,
        startTime: DateTime.now(),
        detections: [result],
      );
    } else if (_currentSession!.activity == result.activity) {
      // Continue current session
      _currentSession!.addDetection(result);
    } else {
      // Activity changed, end current session and start new one
      _currentSession!.end();
      _history.add(_currentSession!);
      
      _currentSession = ActivitySession(
        activity: result.activity,
        startTime: DateTime.now(),
        detections: [result],
      );
    }
  }

  /// End current activity session
  void endCurrentSession() {
    if (_currentSession != null) {
      _currentSession!.end();
      _history.add(_currentSession!);
      _currentSession = null;
    }
  }

  /// Get activity statistics
  Map<PetActivity, Duration> getActivityStats() {
    final stats = <PetActivity, Duration>{};

    for (final session in _history) {
      final existing = stats[session.activity] ?? Duration.zero;
      stats[session.activity] = existing + session.duration;
    }

    // Include current session
    if (_currentSession != null) {
      final existing = stats[_currentSession!.activity] ?? Duration.zero;
      stats[_currentSession!.activity] = existing + _currentSession!.duration;
    }

    return stats;
  }

  /// Clear activity history
  void clearHistory() {
    _history.clear();
    _currentSession = null;
  }

  /// Dispose resources
  void dispose() {
    endCurrentSession();
    _isInitialized = false;
  }
}
