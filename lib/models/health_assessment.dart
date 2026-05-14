enum HealthStatus {
  unknown,
  concerning,
  fair,
  good;

  String get name {
    switch (this) {
      case HealthStatus.good:
        return 'Good';
      case HealthStatus.fair:
        return 'Fair';
      case HealthStatus.concerning:
        return 'Concerning';
      case HealthStatus.unknown:
        return 'Unknown';
    }
  }
}

enum HealthIssueType {
  skinCondition,
  injury,
  abnormality,
  parasite,
  malnutrition,
  none;

  String get displayName {
    switch (this) {
      case HealthIssueType.skinCondition:
        return 'Skin Condition';
      case HealthIssueType.injury:
        return 'Injury';
      case HealthIssueType.abnormality:
        return 'Abnormality';
      case HealthIssueType.parasite:
        return 'Parasite';
      case HealthIssueType.malnutrition:
        return 'Malnutrition';
      case HealthIssueType.none:
        return 'No Issues Detected';
    }
  }
}

enum HealthSeverity {
  none,
  mild,
  moderate,
  severe;

  String get displayName {
    switch (this) {
      case HealthSeverity.none:
        return 'None';
      case HealthSeverity.mild:
        return 'Mild';
      case HealthSeverity.moderate:
        return 'Moderate';
      case HealthSeverity.severe:
        return 'Severe';
    }
  }

  String get emoji {
    switch (this) {
      case HealthSeverity.none:
        return '✅';
      case HealthSeverity.mild:
        return '⚠️';
      case HealthSeverity.moderate:
        return '⚠️';
      case HealthSeverity.severe:
        return '🚨';
    }
  }
}

class HealthIssue {
  final HealthIssueType type;
  final HealthSeverity severity;
  final String description;
  final double confidence;
  final String? location; // e.g., "left ear", "back leg"

  HealthIssue({
    required this.type,
    required this.severity,
    required this.description,
    required this.confidence,
    this.location,
  });

  Map<String, dynamic> toJson() => {
        'type': type.name,
        'severity': severity.name,
        'description': description,
        'confidence': confidence,
        'location': location,
      };

  factory HealthIssue.fromJson(Map<String, dynamic> json) => HealthIssue(
        type: HealthIssueType.values.firstWhere(
          (e) => e.name == json['type'],
          orElse: () => HealthIssueType.none,
        ),
        severity: HealthSeverity.values.firstWhere(
          (e) => e.name == json['severity'],
          orElse: () => HealthSeverity.none,
        ),
        description: json['description'] as String,
        confidence: json['confidence'] as double,
        location: json['location'] as String?,
      );
}

class HealthAssessment {
  final double overallScore; // 0-1 now for consistency
  final double? skinCondition; // 0-1
  final HealthStatus status;
  final List<HealthIssue> issues;
  final List<String> recommendations;
  final DateTime timestamp;
  final bool requiresVetVisit;

  HealthAssessment({
    required this.overallScore,
    this.skinCondition,
    HealthStatus? status,
    List<HealthIssue>? issues,
    List<String>? recommendations,
    DateTime? timestamp,
    bool? requiresVetVisit,
  }) : issues = issues ?? [],
       recommendations = recommendations ?? [],
       timestamp = timestamp ?? DateTime.now(),
       requiresVetVisit = requiresVetVisit ?? false,
       status = status ?? _determineStatus(overallScore);

  bool get isHealthy => overallScore >= 80 && issues.isEmpty;
  bool get hasConcerns => overallScore < 70 || issues.isNotEmpty;
  bool get hasSevereIssues =>
      issues.any((i) => i.severity == HealthSeverity.severe);

  HealthSeverity get maxSeverity {
    if (issues.isEmpty) return HealthSeverity.none;
    return issues
        .map((i) => i.severity)
        .reduce((a, b) => a.index > b.index ? a : b);
  }

  String get statusMessage {
    if (overallScore >= 90) return 'Excellent Health';
    if (overallScore >= 80) return 'Good Health';
    if (overallScore >= 70) return 'Fair Health';
    if (overallScore >= 60) return 'Needs Attention';
    return 'Requires Immediate Care';
  }

  Map<String, dynamic> toJson() => {
        'overallScore': overallScore,
        'issues': issues.map((i) => i.toJson()).toList(),
        'recommendations': recommendations,
        'timestamp': timestamp.toIso8601String(),
        'requiresVetVisit': requiresVetVisit,
      };

  factory HealthAssessment.fromJson(Map<String, dynamic> json) =>
      HealthAssessment(
        overallScore: json['overallScore'] as double,
        issues: (json['issues'] as List<dynamic>)
            .map((i) => HealthIssue.fromJson(i as Map<String, dynamic>))
            .toList(),
        recommendations: (json['recommendations'] as List<dynamic>)
            .map((r) => r as String)
            .toList(),
        timestamp: DateTime.parse(json['timestamp'] as String),
        requiresVetVisit: json['requiresVetVisit'] as bool,
      );

  static HealthStatus _determineStatus(double score) {
    if (score >= 0.8) return HealthStatus.good;
    if (score >= 0.6) return HealthStatus.fair;
    if (score > 0) return HealthStatus.concerning;
    return HealthStatus.unknown;
  }

  @override
  String toString() =>
      'HealthAssessment(score: $overallScore, issues: ${issues.length}, status: $statusMessage)';
}
