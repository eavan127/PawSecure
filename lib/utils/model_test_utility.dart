import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;

/// Utility class for testing and validating TFLite models
class ModelTestUtility {
  /// Test if a model file exists and can be loaded
  static Future<ModelTestResult> testModel(String modelPath) async {
    final result = ModelTestResult(modelPath: modelPath);
    final startTime = DateTime.now();

    try {
      // 1. Try to load the model
      debugPrint('🔍 Testing model: $modelPath');
      final interpreter = await Interpreter.fromAsset(modelPath);

      result.modelLoaded = true;
      result.loadTime = DateTime.now().difference(startTime);

      // 2. Get model details
      final inputTensors = interpreter.getInputTensors();
      final outputTensors = interpreter.getOutputTensors();

      if (inputTensors.isNotEmpty) {
        result.inputShape = inputTensors[0].shape;
        result.inputType = inputTensors[0].type.toString();
      }

      if (outputTensors.isNotEmpty) {
        result.outputShape = outputTensors[0].shape;
        result.outputType = outputTensors[0].type.toString();
      }

      // 3. Run inference benchmark
      final benchmarkResult = await _runInferenceBenchmark(interpreter, result.inputShape!);
      result.inferenceTime = benchmarkResult['inferenceTime'];
      result.memoryUsage = benchmarkResult['memoryBytes'];

      interpreter.close();

      result.success = true;
      result.message = '✅ Model validated successfully';
      debugPrint(result.message);
    } catch (e) {
      result.success = false;
      result.message = '❌ Model test failed: $e';
      debugPrint(result.message);
    }

    return result;
  }

  /// Run inference benchmark with dummy data
  static Future<Map<String, dynamic>> _runInferenceBenchmark(
    Interpreter interpreter,
    List<int> inputShape,
  ) async {
    const iterations = 10;
    final times = <Duration>[];

    try {
      // Create dummy input matching the expected shape
      final input = _createDummyInput(inputShape);

      // Prepare output buffer
      final outputShape = interpreter.getOutputTensors()[0].shape;
      final output = _createOutputBuffer(outputShape);

      // Warm-up run
      interpreter.run(input, output);

      // Benchmark runs
      for (int i = 0; i < iterations; i++) {
        final start = DateTime.now();
        interpreter.run(input, output);
        final duration = DateTime.now().difference(start);
        times.add(duration);
      }

      // Calculate average
      final avgMs = times.map((d) => d.inMicroseconds).reduce((a, b) => a + b) / times.length / 1000;

      return {
        'inferenceTime': Duration(microseconds: (avgMs * 1000).toInt()),
        'memoryBytes': _estimateMemoryUsage(inputShape, outputShape),
      };
    } catch (e) {
      debugPrint('❌ Benchmark failed: $e');
      return {
        'inferenceTime': Duration.zero,
        'memoryBytes': 0,
      };
    }
  }

  /// Create dummy input tensor
  static dynamic _createDummyInput(List<int> shape) {
    if (shape.length == 4) {
      // 4D tensor [batch, height, width, channels]
      return List.generate(shape[0], (_) =>
        List.generate(shape[1], (_) =>
          List.generate(shape[2], (_) =>
            List.generate(shape[3], (_) => 0.5)
          )
        )
      );
    } else if (shape.length == 2) {
      // 2D tensor [batch, features]
      return List.generate(shape[0], (_) =>
        List.generate(shape[1], (_) => 0.5)
      );
    }
    return [];
  }

  /// Create output buffer matching shape
  static dynamic _createOutputBuffer(List<int> shape) {
    if (shape.length == 2) {
      return List.generate(shape[0], (_) =>
        List.filled(shape[1], 0.0)
      );
    } else if (shape.length == 3) {
      return List.generate(shape[0], (_) =>
        List.generate(shape[1], (_) =>
          List.filled(shape[2], 0.0)
        )
      );
    }
    return [];
  }

  /// Estimate memory usage based on tensor shapes
  static int _estimateMemoryUsage(List<int> inputShape, List<int> outputShape) {
    int inputBytes = inputShape.reduce((a, b) => a * b) * 4; // 4 bytes per float
    int outputBytes = outputShape.reduce((a, b) => a * b) * 4;
    return inputBytes + outputBytes;
  }

  /// Test all models in the app
  static Future<List<ModelTestResult>> testAllModels() async {
    final models = [
      'assets/ssd_mobilenet_v2.tflite',
      'assets/models/breed_classifier.tflite',
      'assets/models/activity_detector.tflite',
      'assets/models/health_detector.tflite',
      'assets/models/pet_feature_extractor.tflite',
    ];

    final results = <ModelTestResult>[];
    for (final model in models) {
      final result = await testModel(model);
      results.add(result);
    }

    return results;
  }

  /// Generate a test report
  static String generateReport(List<ModelTestResult> results) {
    final buffer = StringBuffer();
    buffer.writeln('=== TFLite Model Test Report ===');
    buffer.writeln('Generated: ${DateTime.now()}');
    buffer.writeln('');

    int successCount = 0;
    int failureCount = 0;

    for (final result in results) {
      buffer.writeln('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      buffer.writeln('Model: ${result.modelPath}');
      buffer.writeln('Status: ${result.success ? "✅ PASS" : "❌ FAIL"}');

      if (result.success) {
        successCount++;
        buffer.writeln('Load Time: ${result.loadTime?.inMilliseconds ?? 0} ms');
        buffer.writeln('Input Shape: ${result.inputShape}');
        buffer.writeln('Input Type: ${result.inputType}');
        buffer.writeln('Output Shape: ${result.outputShape}');
        buffer.writeln('Output Type: ${result.outputType}');
        buffer.writeln('Avg Inference Time: ${result.inferenceTime?.inMilliseconds ?? 0} ms');
        buffer.writeln('Estimated Memory: ${(result.memoryUsage ?? 0) ~/ 1024} KB');
      } else {
        failureCount++;
        buffer.writeln('Error: ${result.message}');
      }

      buffer.writeln('');
    }

    buffer.writeln('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    buffer.writeln('Summary:');
    buffer.writeln('✅ Passed: $successCount');
    buffer.writeln('❌ Failed: $failureCount');
    buffer.writeln('Total: ${results.length}');

    return buffer.toString();
  }

  /// Test model with actual image file
  static Future<ModelInferenceResult> testWithImage(
    String modelPath,
    File imageFile,
  ) async {
    final result = ModelInferenceResult(modelPath: modelPath);

    try {
      // Load model
      final interpreter = await Interpreter.fromAsset(modelPath);

      // Load and preprocess image
      final imageBytes = await imageFile.readAsBytes();
      final image = img.decodeImage(imageBytes);

      if (image == null) {
        result.success = false;
        result.message = 'Failed to decode image';
        return result;
      }

      // Get expected input size
      final inputShape = interpreter.getInputTensors()[0].shape;
      final expectedWidth = inputShape[2];
      final expectedHeight = inputShape[1];

      // Resize image
      final resized = img.copyResize(image, width: expectedWidth, height: expectedHeight);

      // Convert to normalized tensor
      final input = _imageToTensor(resized);

      // Prepare output
      final outputShape = interpreter.getOutputTensors()[0].shape;
      final output = _createOutputBuffer(outputShape);

      // Run inference
      final start = DateTime.now();
      interpreter.run(input, output);
      result.inferenceTime = DateTime.now().difference(start);

      result.output = output;
      result.success = true;
      result.message = '✅ Inference successful';

      interpreter.close();
    } catch (e) {
      result.success = false;
      result.message = '❌ Inference failed: $e';
    }

    return result;
  }

  /// Convert image to normalized tensor
  static List<List<List<List<double>>>> _imageToTensor(img.Image image) {
    return List.generate(1, (_) {
      return List.generate(image.height, (y) {
        return List.generate(image.width, (x) {
          final pixel = image.getPixel(x, y);
          // Normalize to [-1, 1]
          return [
            (pixel.r.toDouble() / 127.5) - 1.0,
            (pixel.g.toDouble() / 127.5) - 1.0,
            (pixel.b.toDouble() / 127.5) - 1.0,
          ];
        });
      });
    });
  }
}

/// Result of model validation test
class ModelTestResult {
  final String modelPath;
  bool modelLoaded = false;
  bool success = false;
  String message = '';
  Duration? loadTime;
  List<int>? inputShape;
  String? inputType;
  List<int>? outputShape;
  String? outputType;
  Duration? inferenceTime;
  int? memoryUsage;

  ModelTestResult({required this.modelPath});

  Map<String, dynamic> toJson() => {
    'modelPath': modelPath,
    'success': success,
    'message': message,
    'loadTimeMs': loadTime?.inMilliseconds,
    'inputShape': inputShape,
    'inputType': inputType,
    'outputShape': outputShape,
    'outputType': outputType,
    'inferenceTimeMs': inferenceTime?.inMilliseconds,
    'memoryUsageBytes': memoryUsage,
  };
}

/// Result of inference test with actual image
class ModelInferenceResult {
  final String modelPath;
  bool success = false;
  String message = '';
  Duration? inferenceTime;
  dynamic output;

  ModelInferenceResult({required this.modelPath});
}
