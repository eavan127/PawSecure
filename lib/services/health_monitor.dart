import 'dart:io';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import '../models/health_assessment.dart';
import 'model_manager.dart';

class HealthMonitorService {
  static const String _modelPath = 'assets/models/health_detector.tflite';
  
  Interpreter? _interpreter;
  bool _isInitialized = false;
  final ModelManager _modelManager = ModelManager();

  bool get isInitialized => _isInitialized;

  /// Load the health monitoring model
  Future<void> loadModel() async {
    if (_isInitialized) {
      debugPrint('✅ Health monitor already initialized');
      return;
    }

    try {
      _interpreter = await _modelManager.loadModel(_modelPath, threads: 4);
      _isInitialized = true;
      debugPrint('✅ Health monitor loaded successfully!');
    } catch (e) {
      debugPrint('❌ Error loading health monitor: $e');
      debugPrint('⚠️ Using visual analysis fallback');
      // Don't set initialized - use fallback
    }
  }

  /// Assess pet health from image file
  Future<HealthAssessment> assessHealth(File imageFile) async {
    try {
      final image = img.decodeImage(imageFile.readAsBytesSync());
      if (image == null) {
        throw Exception('Failed to decode image');
      }

      return await _assessImage(image);
    } catch (e) {
      debugPrint('❌ Error assessing health: $e');
      return _createDefaultAssessment();
    }
  }

  /// Assess health from image bytes
  Future<HealthAssessment> assessHealthFromBytes(Uint8List bytes) async {
    try {
      final image = img.decodeImage(bytes);
      if (image == null) {
        throw Exception('Failed to decode image bytes');
      }

      return await _assessImage(image);
    } catch (e) {
      debugPrint('❌ Error assessing health from bytes: $e');
      return _createDefaultAssessment();
    }
  }

  /// Assess health from decoded image
  Future<HealthAssessment> _assessImage(img.Image image) async {
    if (_interpreter == null) {
      // Use visual analysis fallback
      return _visualAnalysisFallback(image);
    }

    try {
      // Resize image
      final resized = img.copyResize(image, width: 224, height: 224);

      // Convert to input buffer
      final inputBuffer = _imageToInputBuffer(resized);

      // Output: [overallScore, skinIssue, injury, abnormality, parasite, malnutrition]
      final outputBuffer = List.filled(6, 0.0).reshape([1, 6]);

      // Run inference
      _interpreter!.run(inputBuffer, outputBuffer);

      // Parse results
      final scores = outputBuffer[0] as List<double>;
      
      return _parseHealthResults(scores);
    } catch (e) {
      debugPrint('❌ Health assessment error: $e');
      return _visualAnalysisFallback(image);
    }
  }

  /// Parse health assessment results from model output
  HealthAssessment _parseHealthResults(List<double> scores) {
    final overallScore = scores[0] * 100; // 0-1 to 0-100
    final List<HealthIssue> issues = [];

    // Check for skin conditions
    if (scores[1] > 0.5) {
      issues.add(HealthIssue(
        type: HealthIssueType.skinCondition,
        severity: _scoreToSeverity(scores[1]),
        description: 'Potential skin condition detected',
        confidence: scores[1],
      ));
    }

    // Check for injuries
    if (scores[2] > 0.5) {
      issues.add(HealthIssue(
        type: HealthIssueType.injury,
        severity: _scoreToSeverity(scores[2]),
        description: 'Possible injury detected',
        confidence: scores[2],
      ));
    }

    // Check for abnormalities
    if (scores[3] > 0.5) {
      issues.add(HealthIssue(
        type: HealthIssueType.abnormality,
        severity: _scoreToSeverity(scores[3]),
        description: 'Abnormality detected',
        confidence: scores[3],
      ));
    }

    // Check for parasites
    if (scores[4] > 0.5) {
      issues.add(HealthIssue(
        type: HealthIssueType.parasite,
        severity: _scoreToSeverity(scores[4]),
        description: 'Possible parasite infestation',
        confidence: scores[4],
      ));
    }

    // Check for malnutrition
    if (scores[5] > 0.5) {
      issues.add(HealthIssue(
        type: HealthIssueType.malnutrition,
        severity: _scoreToSeverity(scores[5]),
        description: 'Signs of malnutrition',
        confidence: scores[5],
      ));
    }

    // Generate recommendations
    final recommendations = _generateRecommendations(overallScore, issues);

    return HealthAssessment(
      overallScore: overallScore,
      issues: issues,
      recommendations: recommendations,
      requiresVetVisit: overallScore < 60 || issues.any((i) => i.severity == HealthSeverity.severe),
    );
  }

  /// Convert score to severity level
  HealthSeverity _scoreToSeverity(double score) {
    if (score < 0.5) return HealthSeverity.none;
    if (score < 0.7) return HealthSeverity.mild;
    if (score < 0.85) return HealthSeverity.moderate;
    return HealthSeverity.severe;
  }

  /// Visual analysis fallback (simplified heuristic)
  HealthAssessment _visualAnalysisFallback(img.Image image) {
    // Simple visual analysis based on image properties
    final brightness = _calculateAverageBrightness(image);
    final colorVariance = _calculateColorVariance(image);
    
    // Heuristic scoring (this is a simplified approach)
    double score = 75.0;
    final List<HealthIssue> issues = [];
    
    // Low brightness might indicate poor image quality or health issues
    if (brightness < 50) {
      score -= 10;
    }
    
    // Very high or low color variance might indicate issues
    if (colorVariance < 20 || colorVariance > 100) {
      score -= 5;
      issues.add(HealthIssue(
        type: HealthIssueType.abnormality,
        severity: HealthSeverity.mild,
        description: 'Image analysis suggests further examination needed',
        confidence: 0.6,
      ));
    }

    return HealthAssessment(
      overallScore: score.clamp(0, 100),
      issues: issues,
      recommendations: _generateRecommendations(score, issues),
      requiresVetVisit: score < 60,
    );
  }

  /// Calculate average brightness
  double _calculateAverageBrightness(img.Image image) {
    int totalBrightness = 0;
    int pixelCount = 0;

    for (int y = 0; y < image.height; y += 10) {
      for (int x = 0; x < image.width; x += 10) {
        final pixel = image.getPixel(x, y);
        totalBrightness += ((pixel.r + pixel.g + pixel.b) / 3).toInt();
        pixelCount++;
      }
    }

    return totalBrightness / pixelCount;
  }

  /// Calculate color variance
  double _calculateColorVariance(img.Image image) {
    final List<int> values = [];

    for (int y = 0; y < image.height; y += 10) {
      for (int x = 0; x < image.width; x += 10) {
        final pixel = image.getPixel(x, y);
        values.add(((pixel.r + pixel.g + pixel.b) / 3).toInt());
      }
    }

    final mean = values.reduce((a, b) => a + b) / values.length;
    final variance = values.map((v) => pow(v - mean, 2)).reduce((a, b) => a + b) / values.length;
    
    return sqrt(variance);
  }

  /// Generate health recommendations
  List<String> _generateRecommendations(double score, List<HealthIssue> issues) {
    final recommendations = <String>[];

    if (score >= 90) {
      recommendations.add('Your pet appears to be in excellent health!');
      recommendations.add('Continue regular checkups and maintain current care routine');
    } else if (score >= 70) {
      recommendations.add('Your pet appears healthy overall');
      recommendations.add('Schedule a routine veterinary checkup');
    } else if (score >= 50) {
      recommendations.add('Some concerns detected - monitor closely');
      recommendations.add('Schedule a veterinary visit soon');
    } else {
      recommendations.add('Immediate veterinary attention recommended');
      recommendations.add('Multiple health concerns detected');
    }

    // Issue-specific recommendations
    for (final issue in issues) {
      switch (issue.type) {
        case HealthIssueType.skinCondition:
          recommendations.add('Check for fleas, ticks, or skin irritation');
          break;
        case HealthIssueType.injury:
          recommendations.add('Examine for visible wounds or signs of pain');
          break;
        case HealthIssueType.parasite:
          recommendations.add('Consult vet about parasite treatment');
          break;
        case HealthIssueType.malnutrition:
          recommendations.add('Review diet and feeding schedule');
          break;
        default:
          break;
      }
    }

    return recommendations;
  }

  /// Create default assessment
  HealthAssessment _createDefaultAssessment() {
    return HealthAssessment(
      overallScore: 75.0,
      issues: [],
      recommendations: [
        'Unable to perform detailed analysis',
        'Please consult with a veterinarian for professional assessment',
      ],
      requiresVetVisit: false,
    );
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
  }
}
