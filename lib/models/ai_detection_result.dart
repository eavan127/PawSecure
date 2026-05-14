class AIDetectionResult {
  final String label;
  final double confidence;
  final BoundingBox box;
  final DateTime timestamp;

  AIDetectionResult({
    required this.label,
    required this.confidence,
    required this.box,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get isDog => label.toLowerCase() == 'dog';
  bool get isCat => label.toLowerCase() == 'cat';
  bool get isPet => isDog || isCat;

  Map<String, dynamic> toJson() => {
        'label': label,
        'confidence': confidence,
        'box': box.toJson(),
        'timestamp': timestamp.toIso8601String(),
      };

  factory AIDetectionResult.fromJson(Map<String, dynamic> json) =>
      AIDetectionResult(
        label: json['label'] as String,
        confidence: json['confidence'] as double,
        box: BoundingBox.fromJson(json['box'] as Map<String, dynamic>),
        timestamp: DateTime.parse(json['timestamp'] as String),
      );

  @override
  String toString() =>
      'AIDetectionResult(label: $label, confidence: ${(confidence * 100).toStringAsFixed(1)}%)';
}

class BoundingBox {
  final double left;
  final double top;
  final double right;
  final double bottom;

  BoundingBox({
    required this.left,
    required this.top,
    required this.right,
    required this.bottom,
  });

  double get width => right - left;
  double get height => bottom - top;
  double get centerX => left + width / 2;
  double get centerY => top + height / 2;

  /// Normalize coordinates to 0-1 range
  BoundingBox normalize(int imageWidth, int imageHeight) {
    return BoundingBox(
      left: left / imageWidth,
      top: top / imageHeight,
      right: right / imageWidth,
      bottom: bottom / imageHeight,
    );
  }

  /// Denormalize coordinates from 0-1 range
  BoundingBox denormalize(int imageWidth, int imageHeight) {
    return BoundingBox(
      left: left * imageWidth,
      top: top * imageHeight,
      right: right * imageWidth,
      bottom: bottom * imageHeight,
    );
  }

  Map<String, dynamic> toJson() => {
        'left': left,
        'top': top,
        'right': right,
        'bottom': bottom,
      };

  factory BoundingBox.fromJson(Map<String, dynamic> json) => BoundingBox(
        left: json['left'] as double,
        top: json['top'] as double,
        right: json['right'] as double,
        bottom: json['bottom'] as double,
      );

  factory BoundingBox.fromList(List<double> coords) {
    // Handle different coordinate formats
    // [top, left, bottom, right] or [left, top, right, bottom]
    if (coords.length == 4) {
      return BoundingBox(
        top: coords[0],
        left: coords[1],
        bottom: coords[2],
        right: coords[3],
      );
    }
    throw ArgumentError('Invalid bounding box coordinates');
  }

  @override
  String toString() =>
      'BoundingBox(left: $left, top: $top, right: $right, bottom: $bottom)';
}
