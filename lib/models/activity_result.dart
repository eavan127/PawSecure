enum PetActivity {
  sitting,
  standing,
  walking,
  running,
  playing,
  eating,
  sleeping,
  unknown;

  String get displayName {
    switch (this) {
      case PetActivity.sitting:
        return 'Sitting';
      case PetActivity.standing:
        return 'Standing';
      case PetActivity.walking:
        return 'Walking';
      case PetActivity.running:
        return 'Running';
      case PetActivity.playing:
        return 'Playing';
      case PetActivity.eating:
        return 'Eating';
      case PetActivity.sleeping:
        return 'Sleeping';
      case PetActivity.unknown:
        return 'Unknown';
    }
  }

  String get emoji {
    switch (this) {
      case PetActivity.sitting:
        return '🪑';
      case PetActivity.standing:
        return '🧍';
      case PetActivity.walking:
        return '🚶';
      case PetActivity.running:
        return '🏃';
      case PetActivity.playing:
        return '🎾';
      case PetActivity.eating:
        return '🍖';
      case PetActivity.sleeping:
        return '😴';
      case PetActivity.unknown:
        return '❓';
    }
  }
}

class ActivityResult {
  final PetActivity activity;
  final double confidence;
  final DateTime timestamp;
  final Duration? duration;

  ActivityResult({
    required this.activity,
    required this.confidence,
    DateTime? timestamp,
    this.duration,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get isHighConfidence => confidence > 0.7;

  Map<String, dynamic> toJson() => {
        'activity': activity.name,
        'confidence': confidence,
        'timestamp': timestamp.toIso8601String(),
        'duration': duration?.inSeconds,
      };

  factory ActivityResult.fromJson(Map<String, dynamic> json) => ActivityResult(
        activity: PetActivity.values.firstWhere(
          (e) => e.name == json['activity'],
          orElse: () => PetActivity.unknown,
        ),
        confidence: json['confidence'] as double,
        timestamp: DateTime.parse(json['timestamp'] as String),
        duration: json['duration'] != null
            ? Duration(seconds: json['duration'] as int)
            : null,
      );

  @override
  String toString() =>
      'ActivityResult(activity: ${activity.displayName}, confidence: ${(confidence * 100).toStringAsFixed(1)}%)';
}

class ActivitySession {
  final PetActivity activity;
  final DateTime startTime;
  DateTime? endTime;
  final List<ActivityResult> detections;

  ActivitySession({
    required this.activity,
    required this.startTime,
    this.endTime,
    List<ActivityResult>? detections,
  }) : detections = detections ?? [];

  Duration get duration =>
      (endTime ?? DateTime.now()).difference(startTime);

  double get averageConfidence {
    if (detections.isEmpty) return 0.0;
    return detections.map((d) => d.confidence).reduce((a, b) => a + b) /
        detections.length;
  }

  void addDetection(ActivityResult result) {
    detections.add(result);
  }

  void end() {
    endTime = DateTime.now();
  }

  Map<String, dynamic> toJson() => {
        'activity': activity.name,
        'startTime': startTime.toIso8601String(),
        'endTime': endTime?.toIso8601String(),
        'detections': detections.map((d) => d.toJson()).toList(),
      };

  factory ActivitySession.fromJson(Map<String, dynamic> json) =>
      ActivitySession(
        activity: PetActivity.values.firstWhere(
          (e) => e.name == json['activity'],
          orElse: () => PetActivity.unknown,
        ),
        startTime: DateTime.parse(json['startTime'] as String),
        endTime: json['endTime'] != null
            ? DateTime.parse(json['endTime'] as String)
            : null,
        detections: (json['detections'] as List<dynamic>)
            .map((d) => ActivityResult.fromJson(d as Map<String, dynamic>))
            .toList(),
      );
}
