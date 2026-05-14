import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:tflite_flutter/tflite_flutter.dart';

/// Centralized model manager for loading, caching, and versioning TFLite models
class ModelManager {
  static final ModelManager _instance = ModelManager._internal();
  factory ModelManager() => _instance;
  ModelManager._internal();

  final Map<String, Interpreter> _loadedModels = {};
  final Map<String, DateTime> _loadTimes = {};

  /// Load a model from assets
  Future<Interpreter> loadModel(
    String modelPath, {
    int threads = 4,
    bool useGpu = false,
    bool forceReload = false,
  }) async {
    // Return cached model if already loaded
    if (!forceReload && _loadedModels.containsKey(modelPath)) {
      debugPrint('✅ Using cached model: $modelPath');
      return _loadedModels[modelPath]!;
    }

    try {
      debugPrint('📦 Loading model: $modelPath');
      final options = InterpreterOptions()..threads = threads;

      if (useGpu) {
        try {
          options.addDelegate(GpuDelegateV2());
          debugPrint('🎮 GPU acceleration enabled');
        } catch (e) {
          debugPrint('⚠️ GPU delegate not available, using CPU: $e');
        }
      }

      final interpreter = await Interpreter.fromAsset(modelPath, options: options);
      
      _loadedModels[modelPath] = interpreter;
      _loadTimes[modelPath] = DateTime.now();
      
      debugPrint('✅ Model loaded successfully: $modelPath');
      debugPrint('   Input shape: ${interpreter.getInputTensor(0).shape}');
      debugPrint('   Output shape: ${interpreter.getOutputTensor(0).shape}');
      
      return interpreter;
    } catch (e) {
      debugPrint('❌ Error loading model $modelPath: $e');
      rethrow;
    }
  }

  /// Get a loaded model
  Interpreter? getModel(String modelPath) {
    return _loadedModels[modelPath];
  }

  /// Check if a model is loaded
  bool isModelLoaded(String modelPath) {
    return _loadedModels.containsKey(modelPath);
  }

  /// Unload a specific model
  void unloadModel(String modelPath) {
    if (_loadedModels.containsKey(modelPath)) {
      _loadedModels[modelPath]?.close();
      _loadedModels.remove(modelPath);
      _loadTimes.remove(modelPath);
      debugPrint('🗑️ Unloaded model: $modelPath');
    }
  }

  /// Unload all models
  void unloadAllModels() {
    for (final interpreter in _loadedModels.values) {
      interpreter.close();
    }
    _loadedModels.clear();
    _loadTimes.clear();
    debugPrint('🗑️ All models unloaded');
  }

  /// Get memory usage statistics
  Map<String, dynamic> getMemoryStats() {
    final stats = <String, dynamic>{
      'loadedModels': _loadedModels.length,
      'models': <String, dynamic>{},
    };

    for (final entry in _loadedModels.entries) {
      final modelPath = entry.key;
      final loadTime = _loadTimes[modelPath];
      
      stats['models'][modelPath] = {
        'loadedAt': loadTime?.toIso8601String(),
        'uptime': loadTime != null 
            ? DateTime.now().difference(loadTime).inSeconds 
            : 0,
      };
    }

    return stats;
  }

  /// Dispose all resources
  void dispose() {
    unloadAllModels();
  }
}

/// Extension for common tensor operations
extension TensorHelper on Interpreter {
  /// Get input tensor information
  TensorInfo getInputInfo([int index = 0]) {
    final tensor = getInputTensor(index);
    return TensorInfo(
      shape: tensor.shape,
      type: tensor.type,
      name: tensor.name,
    );
  }

  /// Get output tensor information
  TensorInfo getOutputInfo([int index = 0]) {
    final tensor = getOutputTensor(index);
    return TensorInfo(
      shape: tensor.shape,
      type: tensor.type,
      name: tensor.name,
    );
  }

  /// Run inference with error handling
  Future<void> runSafe(Object input, Object output) async {
    try {
      run(input, output);
    } catch (e) {
      debugPrint('❌ Inference error: $e');
      rethrow;
    }
  }
}

class TensorInfo {
  final List<int> shape;
  final TensorType type;
  final String name;

  TensorInfo({
    required this.shape,
    required this.type,
    required this.name,
  });

  int get batch => shape.isNotEmpty ? shape[0] : 1;
  int get height => shape.length > 1 ? shape[1] : 0;
  int get width => shape.length > 2 ? shape[2] : 0;
  int get channels => shape.length > 3 ? shape[3] : 0;

  int get totalElements => shape.reduce((a, b) => a * b);

  @override
  String toString() => 'TensorInfo(shape: $shape, type: $type, name: $name)';
}
