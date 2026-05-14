import 'dart:math';

class MatchResult {
// ... (lines 2-96 unchanged) ...
    
    final denominator = (sqrt(normA) * sqrt(normB));
    if (denominator == 0) return 0.0;

    return dotProduct / denominator;
  }

  /// Calculate Euclidean distance between two feature vectors
  static double euclideanDistance(
      List<double> vectorA, List<double> vectorB) {
    if (vectorA.length != vectorB.length) {
      throw ArgumentError('Vectors must have the same length');
    }

    double sum = 0.0;
    for (int i = 0; i < vectorA.length; i++) {
      final diff = vectorA[i] - vectorB[i];
      sum += diff * diff;
    }

    return sqrt(sum);
  }

  double similarityTo(PetFeatureVector other) {
    return cosineSimilarity(features, other.features);
  }

  Map<String, dynamic> toJson() => {
        'petId': petId,
        'features': features,
        'extractedAt': extractedAt.toIso8601String(),
        'imageUrl': imageUrl,
      };

  factory PetFeatureVector.fromJson(Map<String, dynamic> json) =>
      PetFeatureVector(
        petId: json['petId'] as String,
        features: (json['features'] as List<dynamic>)
            .map((f) => f as double)
            .toList(),
        extractedAt: DateTime.parse(json['extractedAt'] as String),
        imageUrl: json['imageUrl'] as String?,
      );
}
