import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import '../models/breed_info.dart';
import 'model_manager.dart';

class BreedClassifierService {
  static const String _modelPath = 'assets/models/breed_classifier.tflite';
  static const String _labelsPath = 'assets/breed_labels.txt';
  
  Interpreter? _interpreter;
  List<BreedLabel> _labels = [];
  bool _isInitialized = false;
  final ModelManager _modelManager = ModelManager();

  bool get isInitialized => _isInitialized;

  /// Load the breed classification model and labels
  Future<void> loadModel() async {
    if (_isInitialized) {
      debugPrint('✅ Breed classifier already initialized');
      return;
    }

    try {
      // Load interpreter via model manager
      _interpreter = await _modelManager.loadModel(_modelPath, threads: 4);

      // Load breed labels
      await _loadLabels();

      _isInitialized = true;
      debugPrint('✅ Breed classifier loaded successfully!');
      debugPrint('📋 Loaded ${_labels.length} breed labels');
    } catch (e) {
      debugPrint('❌ Error loading breed classifier: $e');
      debugPrint('⚠️ Note: Using fallback to object detector for now');
      // Don't rethrow - we'll use fallback detection
    }
  }

  Future<void> _loadLabels() async {
    try {
      final labelsData = await rootBundle.loadString(_labelsPath);
      _labels = labelsData
          .split('\n')
          .where((line) => line.trim().isNotEmpty)
          .map((line) => BreedLabel.fromString(line))
          .toList();
    } catch (e) {
      debugPrint('⚠️ Could not load breed labels: $e');
      // Use default labels as fallback
      _labels = _getDefaultBreedLabels();
    }
  }

  /// Classify breed from image file
  Future<BreedInfo?> classifyBreed(File imageFile) async {
    if (!_isInitialized || _interpreter == null) {
      debugPrint('⚠️ Breed classifier not initialized, using fallback');
      return _getFallbackBreedInfo();
    }

    try {
      // 1. Load and preprocess image
      final image = img.decodeImage(imageFile.readAsBytesSync());
      if (image == null) {
        throw Exception('Failed to decode image');
      }

      return await _classifyImage(image);
    } catch (e) {
      debugPrint('❌ Error classifying breed: $e');
      return null;
    }
  }

  /// Classify breed from raw image bytes
  Future<BreedInfo?> classifyBreedFromBytes(Uint8List bytes) async {
    if (!_isInitialized || _interpreter == null) {
      return _getFallbackBreedInfo();
    }

    try {
      final image = img.decodeImage(bytes);
      if (image == null) {
        throw Exception('Failed to decode image bytes');
      }

      return await _classifyImage(image);
    } catch (e) {
      debugPrint('❌ Error classifying breed from bytes: $e');
      return null;
    }
  }

  /// Classify breed from decoded image
  Future<BreedInfo?> _classifyImage(img.Image image) async {
    // Resize to model input size (typically 224x224 for MobileNet)
    final resized = img.copyResize(image, width: 224, height: 224);

    // Convert to normalized float buffer
    final inputBuffer = _imageToInputBuffer(resized);

    // Prepare output buffer
    final outputBuffer = List.filled(_labels.length, 0.0).reshape([1, _labels.length]);

    // Run inference
    _interpreter!.run(inputBuffer, outputBuffer);

    // Get top prediction
    final probabilities = outputBuffer[0] as List<double>;
    final topIndex = _getTopPrediction(probabilities);
    final confidence = probabilities[topIndex];

    if (confidence < 0.3) {
      debugPrint('⚠️ Low confidence: ${(confidence * 100).toStringAsFixed(1)}%');
      return null;
    }

    final breedLabel = _labels[topIndex];
    
    return BreedInfo(
      breedName: breedLabel.name,
      species: breedLabel.species,
      confidence: confidence,
      characteristics: breedLabel.characteristics,
      temperament: breedLabel.temperament,
      size: breedLabel.size,
      origin: breedLabel.origin,
    );
  }

  /// Convert image to normalized input buffer
  List<List<List<List<double>>>> _imageToInputBuffer(img.Image image) {
    return List.generate(1, (_) {
      return List.generate(224, (y) {
        return List.generate(224, (x) {
          final pixel = image.getPixel(x, y);
          // Normalize to [-1, 1] for MobileNet
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

  /// Get top N predictions
  List<BreedInfo> getTopPredictions(List<double> probabilities, {int topN = 5}) {
    final indexed = List.generate(
      probabilities.length,
      (i) => MapEntry(i, probabilities[i]),
    );

    indexed.sort((a, b) => b.value.compareTo(a.value));

    return indexed.take(topN).map((entry) {
      final breedLabel = _labels[entry.key];
      return BreedInfo(
        breedName: breedLabel.name,
        species: breedLabel.species,
        confidence: entry.value,
        characteristics: breedLabel.characteristics,
        temperament: breedLabel.temperament,
        size: breedLabel.size,
        origin: breedLabel.origin,
      );
    }).toList();
  }

  /// Fallback breed info when model is not available
  BreedInfo? _getFallbackBreedInfo() {
    // Return generic pet info
    return BreedInfo(
      breedName: 'Pet',
      species: 'unknown',
      confidence: 0.5,
      characteristics: 'Breed detection model not available',
    );
  }

  /// Get default breed labels as fallback
  List<BreedLabel> _getDefaultBreedLabels() {
    return [
      BreedLabel('Labrador Retriever', 'dog', 'Friendly, Active', 'Friendly, Outgoing', 'Large', 'Canada'),
      BreedLabel('German Shepherd', 'dog', 'Loyal, Courageous', 'Confident, Courageous', 'Large', 'Germany'),
      BreedLabel('Golden Retriever', 'dog', 'Intelligent, Friendly', 'Friendly, Reliable', 'Large', 'Scotland'),
      BreedLabel('French Bulldog', 'dog', 'Adaptable, Playful', 'Playful, Adaptable', 'Small', 'France'),
      BreedLabel('Bulldog', 'dog', 'Calm, Courageous', 'Docile, Friendly', 'Medium', 'England'),
      BreedLabel('Poodle', 'dog', 'Intelligent, Active', 'Intelligent, Active', 'Various', 'Germany/France'),
      BreedLabel('Beagle', 'dog', 'Curious, Friendly', 'Amiable, Determined', 'Small-Medium', 'England'),
      BreedLabel('Rottweiler', 'dog', 'Loyal, Confident', 'Loyal, Loving', 'Large', 'Germany'),
      BreedLabel('Siamese', 'cat', 'Vocal, Social', 'Affectionate, Intelligent', 'Medium', 'Thailand'),
      BreedLabel('Persian', 'cat', 'Quiet, Sweet', 'Gentle, Calm', 'Medium', 'Iran'),
      BreedLabel('Maine Coon', 'cat', 'Gentle, Playful', 'Friendly, Intelligent', 'Large', 'USA'),
      BreedLabel('Bengal', 'cat', 'Active, Playful', 'Energetic, Alert', 'Medium', 'USA'),
      BreedLabel('British Shorthair', 'cat', 'Calm, Easygoing', 'Calm, Affectionate', 'Medium', 'UK'),
    ];
  }

  /// Dispose resources
  void dispose() {
    // Model manager handles interpreter cleanup
    _isInitialized = false;
  }
}

/// Helper class for breed labels
class BreedLabel {
  final String name;
  final String species;
  final String? characteristics;
  final String? temperament;
  final String? size;
  final String? origin;

  BreedLabel(
    this.name,
    this.species, [
    this.characteristics,
    this.temperament,
    this.size,
    this.origin,
  ]);

  factory BreedLabel.fromString(String line) {
    final parts = line.split('|');
    return BreedLabel(
      parts[0].trim(),
      parts.length > 1 ? parts[1].trim() : 'unknown',
      parts.length > 2 ? parts[2].trim() : null,
      parts.length > 3 ? parts[3].trim() : null,
      parts.length > 4 ? parts[4].trim() : null,
      parts.length > 5 ? parts[5].trim() : null,
    );
  }
}
