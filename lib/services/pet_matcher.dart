import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import '../models/match_result.dart';
import 'model_manager.dart';

class PetMatcherService {
  static const String _modelPath = 'assets/models/pet_feature_extractor.tflite';
  
  Interpreter? _interpreter;
  bool _isInitialized = false;
  final ModelManager _modelManager = ModelManager();

  // In-memory database of pet features
  final Map<String, PetFeatureVector> _petDatabase = {};

  bool get isInitialized => _isInitialized;
  int get databaseSize => _petDatabase.length;

  /// Load the feature extraction model
  Future<void> loadModel() async {
    if (_isInitialized) {
      debugPrint('✅ Pet matcher already initialized');
      return;
    }

    try {
      _interpreter = await _modelManager.loadModel(_modelPath, threads: 4);
      _isInitialized = true;
      debugPrint('✅ Pet matcher loaded successfully!');
    } catch (e) {
      debugPrint('❌ Error loading pet matcher: $e');
      debugPrint('⚠️ Using simplified matching fallback');
      // Don't set initialized - use fallback
    }
  }

  /// Extract features from image file
  Future<PetFeatureVector?> extractFeatures(
    File imageFile, {
    required String petId,
    String? imageUrl,
  }) async {
    try {
      final image = img.decodeImage(imageFile.readAsBytesSync());
      if (image == null) {
        throw Exception('Failed to decode image');
      }

      return await _extractFromImage(image, petId: petId, imageUrl: imageUrl);
    } catch (e) {
      debugPrint('❌ Error extracting features: $e');
      return null;
    }
  }

  /// Extract features from image bytes
  Future<PetFeatureVector?> extractFeaturesFromBytes(
    Uint8List bytes, {
    required String petId,
    String? imageUrl,
  }) async {
    try {
      final image = img.decodeImage(bytes);
      if (image == null) {
        throw Exception('Failed to decode image bytes');
      }

      return await _extractFromImage(image, petId: petId, imageUrl: imageUrl);
    } catch (e) {
      debugPrint('❌ Error extracting features from bytes: $e');
      return null;
    }
  }

  /// Extract features from decoded image
  Future<PetFeatureVector?> _extractFromImage(
    img.Image image, {
    required String petId,
    String? imageUrl,
  }) async {
    if (_interpreter == null) {
      // Use simplified fallback
      return _simplifiedFeatureExtraction(image, petId: petId, imageUrl: imageUrl);
    }

    try {
      // Resize to model input size
      final resized = img.copyResize(image, width: 224, height: 224);

      // Convert to input buffer
      final inputBuffer = _imageToInputBuffer(resized);

      // Feature vector output (typically 128 or 256 dimensions)
      final featureDim = 128; // Adjust based on your model
      final outputBuffer = List.filled(featureDim, 0.0).reshape([1, featureDim]);

      // Run inference
      _interpreter!.run(inputBuffer, outputBuffer);

      // Extract feature vector
      final features = List<double>.from(outputBuffer[0]);

      final featureVector = PetFeatureVector(
        petId: petId,
        features: features,
        imageUrl: imageUrl,
      );

      return featureVector;
    } catch (e) {
      debugPrint('❌ Feature extraction error: $e');
      return _simplifiedFeatureExtraction(image, petId: petId, imageUrl: imageUrl);
    }
  }

  /// Simplified feature extraction fallback
  PetFeatureVector _simplifiedFeatureExtraction(
    img.Image image, {
    required String petId,
    String? imageUrl,
  }) {
    // Extract simple visual features as a basic fingerprint
    final features = <double>[];

    // Color histogram features (simplified)
    final rHist = List.filled(8, 0.0);
    final gHist = List.filled(8, 0.0);
    final bHist = List.filled(8, 0.0);

    for (int y = 0; y < image.height; y += 5) {
      for (int x = 0; x < image.width; x += 5) {
        final pixel = image.getPixel(x, y);
        rHist[(pixel.r ~/ 32).clamp(0, 7)]++;
        gHist[(pixel.g ~/ 32).clamp(0, 7)]++;
        bHist[(pixel.b ~/ 32).clamp(0, 7)]++;
      }
    }

    // Normalize and add to features
    final totalPixels = (image.width / 5) * (image.height / 5);
    features.addAll(rHist.map((v) => v / totalPixels));
    features.addAll(gHist.map((v) => v / totalPixels));
    features.addAll(bHist.map((v) => v / totalPixels));

    // Add texture features (edge detection simplified)
    double edgeStrength = 0.0;
    for (int y = 1; y < image.height - 1; y += 10) {
      for (int x = 1; x < image.width - 1; x += 10) {
        final center = image.getPixel(x, y);
        final right = image.getPixel(x + 1, y);
        final bottom = image.getPixel(x, y + 1);
        
        edgeStrength += ((center.r - right.r).abs() + (center.r - bottom.r).abs());
      }
    }
    features.add(edgeStrength / (image.width * image.height));

    // Pad to 128 dimensions
    while (features.length < 128) {
      features.add(0.0);
    }

    return PetFeatureVector(
      petId: petId,
      features: features.take(128).toList(),
      imageUrl: imageUrl,
    );
  }

  /// Add pet to database
  void addPetToDatabase(PetFeatureVector featureVector) {
    _petDatabase[featureVector.petId] = featureVector;
    debugPrint('✅ Added pet ${featureVector.petId} to database');
  }

  /// Find matching pets
  Future<List<MatchResult>> findMatches(
    File imageFile, {
    int topN = 10,
    double minSimilarity = 0.5,
  }) async {
    final queryFeatures = await extractFeatures(
      imageFile,
      petId: 'query_${DateTime.now().millisecondsSinceEpoch}',
    );

    if (queryFeatures == null) {
      debugPrint('❌ Failed to extract features from query image');
      return [];
    }

    return _findMatchesFromFeatures(queryFeatures, topN: topN, minSimilarity: minSimilarity);
  }

  /// Find matches from feature vector
  List<MatchResult> _findMatchesFromFeatures(
    PetFeatureVector queryFeatures, {
    int topN = 10,
    double minSimilarity = 0.5,
  }) {
    if (_petDatabase.isEmpty) {
      debugPrint('⚠️ Pet database is empty');
      return [];
    }

    final matches = <MatchResult>[];

    for (final entry in _petDatabase.entries) {
      final similarity = queryFeatures.similarityTo(entry.value);

      if (similarity >= minSimilarity) {
        matches.add(MatchResult(
          petId: entry.key,
          petName: 'Pet ${entry.key}', // Would come from actual pet data
          similarityScore: similarity,
          imageUrl: entry.value.imageUrl,
        ));
      }
    }

    // Sort by similarity (highest first)
    matches.sort((a, b) => b.similarityScore.compareTo(a.similarityScore));

    // Return top N matches
    return matches.take(topN).toList();
  }

  /// Load pet database from JSON
  void loadPetDatabase(List<Map<String, dynamic>> petsData) {
    for (final data in petsData) {
      try {
        final featureVector = PetFeatureVector.fromJson(data);
        _petDatabase[featureVector.petId] = featureVector;
      } catch (e) {
        debugPrint('⚠️ Error loading pet data: $e');
      }
    }
    debugPrint('✅ Loaded ${_petDatabase.length} pets into database');
  }

  /// Export pet database to JSON
  List<Map<String, dynamic>> exportPetDatabase() {
    return _petDatabase.values.map((v) => v.toJson()).toList();
  }

  /// Clear pet database
  void clearDatabase() {
    _petDatabase.clear();
    debugPrint('🗑️ Pet database cleared');
  }

  /// Remove pet from database
  void removePet(String petId) {
    _petDatabase.remove(petId);
    debugPrint('🗑️ Removed pet $petId from database');
  }

  /// Convert image to input buffer
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

  /// Dispose resources
  void dispose() {
    _isInitialized = false;
    // Keep database - it's in-memory and might be reused
  }
}
