import 'package:flutter/material.dart';
import '../models/ai_detection_result.dart';
import '../models/breed_info.dart';
import '../models/activity_result.dart';
import '../models/health_assessment.dart';

/// Reusable widget for displaying AI detection overlays on camera feeds
class AIOverlayWidget extends StatelessWidget {
  final Size imageSize;
  final List<AIDetectionResult>? objectDetections;
  final BreedInfo? breedInfo;
  final ActivityResult? activityResult;
  final HealthAssessment? healthAssessment;
  final bool showBoundingBoxes;
  final bool showBreedLabels;
  final bool showActivityLabels;
  final bool showHealthIndicators;

  const AIOverlayWidget({
    super.key,
    required this.imageSize,
    this.objectDetections,
    this.breedInfo,
    this.activityResult,
    this.healthAssessment,
    this.showBoundingBoxes = true,
    this.showBreedLabels = true,
    this.showActivityLabels = true,
    this.showHealthIndicators = true,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: imageSize,
      painter: _AIOverlayPainter(
        objectDetections: objectDetections,
        breedInfo: breedInfo,
        activityResult: activityResult,
        healthAssessment: healthAssessment,
        showBoundingBoxes: showBoundingBoxes,
        showBreedLabels: showBreedLabels,
        showActivityLabels: showActivityLabels,
        showHealthIndicators: showHealthIndicators,
      ),
    );
  }
}

class _AIOverlayPainter extends CustomPainter {
  final List<AIDetectionResult>? objectDetections;
  final BreedInfo? breedInfo;
  final ActivityResult? activityResult;
  final HealthAssessment? healthAssessment;
  final bool showBoundingBoxes;
  final bool showBreedLabels;
  final bool showActivityLabels;
  final bool showHealthIndicators;

  _AIOverlayPainter({
    this.objectDetections,
    this.breedInfo,
    this.activityResult,
    this.healthAssessment,
    required this.showBoundingBoxes,
    required this.showBreedLabels,
    required this.showActivityLabels,
    required this.showHealthIndicators,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Draw bounding boxes for object detections
    if (showBoundingBoxes && objectDetections != null) {
      for (final detection in objectDetections!) {
        _drawBoundingBox(canvas, size, detection);
      }
    }

    // Draw breed label (top-left)
    if (showBreedLabels && breedInfo != null) {
      _drawBreedLabel(canvas, size);
    }

    // Draw activity label (top-right)
    if (showActivityLabels && activityResult != null) {
      _drawActivityLabel(canvas, size);
    }

    // Draw health indicator (bottom-left)
    if (showHealthIndicators && healthAssessment != null) {
      _drawHealthIndicator(canvas, size);
    }
  }

  void _drawBoundingBox(Canvas canvas, Size size, AIDetectionResult detection) {
    final box = detection.box;

    // Draw rectangle
    final paint = Paint()
      ..color = _getColorForLabel(detection.label)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    final rect = Rect.fromLTRB(
      box.left,
      box.top,
      box.right,
      box.bottom,
    );

    canvas.drawRect(rect, paint);

    // Draw label background
    final labelText = '${detection.label} ${(detection.confidence * 100).toStringAsFixed(0)}%';
    final textPainter = TextPainter(
      text: TextSpan(
        text: labelText,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    );

    textPainter.layout();

    // Background rectangle for label
    final labelRect = Rect.fromLTWH(
      box.left,
      box.top - 24,
      textPainter.width + 8,
      24,
    );

    final labelBgPaint = Paint()
      ..color = _getColorForLabel(detection.label).withOpacity(0.8);

    canvas.drawRect(labelRect, labelBgPaint);

    // Draw text
    textPainter.paint(canvas, Offset(box.left + 4, box.top - 22));
  }

  void _drawBreedLabel(Canvas canvas, Size size) {
    final text = '${breedInfo!.breedName} (${(breedInfo!.confidence * 100).toStringAsFixed(0)}%)';
    final textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.bold,
          shadows: [
            Shadow(
              offset: Offset(1, 1),
              blurRadius: 3,
              color: Colors.black,
            ),
          ],
        ),
      ),
      textDirection: TextDirection.ltr,
    );

    textPainter.layout();

    // Background
    final bgRect = Rect.fromLTWH(8, 8, textPainter.width + 12, 32);
    final bgPaint = Paint()
      ..color = Colors.blue.withOpacity(0.7)
      ..style = PaintingStyle.fill;

    canvas.drawRRect(
      RRect.fromRectAndRadius(bgRect, const Radius.circular(6)),
      bgPaint,
    );

    // Text
    textPainter.paint(canvas, const Offset(14, 14));
  }

  void _drawActivityLabel(Canvas canvas, Size size) {
    final activityName = activityResult!.activity.name.toUpperCase();
    final confidence = (activityResult!.confidence * 100).toStringAsFixed(0);
    final text = '$activityName $confidence%';

    final textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.bold,
          shadows: [
            Shadow(
              offset: Offset(1, 1),
              blurRadius: 3,
              color: Colors.black,
            ),
          ],
        ),
      ),
      textDirection: TextDirection.ltr,
    );

    textPainter.layout();

    // Position at top-right
    final x = size.width - textPainter.width - 20;
    final bgRect = Rect.fromLTWH(x - 6, 8, textPainter.width + 12, 32);
    final bgPaint = Paint()
      ..color = _getActivityColor(activityResult!.activity).withOpacity(0.7)
      ..style = PaintingStyle.fill;

    canvas.drawRRect(
      RRect.fromRectAndRadius(bgRect, const Radius.circular(6)),
      bgPaint,
    );

    textPainter.paint(canvas, Offset(x, 14));
  }

  void _drawHealthIndicator(Canvas canvas, Size size) {
    final score = healthAssessment!.overallScore;
    final status = healthAssessment!.status;

    // Icon
    final iconPainter = TextPainter(
      text: TextSpan(
        text: _getHealthIcon(status),
        style: const TextStyle(
          fontSize: 24,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    iconPainter.layout();

    // Text
    final text = 'Health: ${(score * 100).toStringAsFixed(0)}%';
    final textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.bold,
          shadows: [
            Shadow(
              offset: Offset(1, 1),
              blurRadius: 3,
              color: Colors.black,
            ),
          ],
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();

    // Background at bottom-left
    final y = size.height - 44;
    final width = iconPainter.width + textPainter.width + 20;
    final bgRect = Rect.fromLTWH(8, y, width, 36);
    final bgPaint = Paint()
      ..color = _getHealthColor(status).withOpacity(0.7)
      ..style = PaintingStyle.fill;

    canvas.drawRRect(
      RRect.fromRectAndRadius(bgRect, const Radius.circular(6)),
      bgPaint,
    );

    // Paint icon and text
    iconPainter.paint(canvas, Offset(14, y + 6));
    textPainter.paint(canvas, Offset(14 + iconPainter.width + 6, y + 10));
  }

  Color _getColorForLabel(String label) {
    final lowerLabel = label.toLowerCase();
    if (lowerLabel.contains('dog')) return Colors.orange;
    if (lowerLabel.contains('cat')) return Colors.purple;
    return Colors.green;
  }

  Color _getActivityColor(PetActivity activity) {
    switch (activity) {
      case PetActivity.running:
      case PetActivity.playing:
        return Colors.orange;
      case PetActivity.walking:
        return Colors.blue;
      case PetActivity.sitting:
      case PetActivity.standing:
        return Colors.green;
      case PetActivity.eating:
        return Colors.amber;
      case PetActivity.sleeping:
        return Colors.indigo;
      default:
        return Colors.grey;
    }
  }

  Color _getHealthColor(HealthStatus status) {
    switch (status) {
      case HealthStatus.good:
        return Colors.green;
      case HealthStatus.fair:
        return Colors.orange;
      case HealthStatus.concerning:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getHealthIcon(HealthStatus status) {
    switch (status) {
      case HealthStatus.good:
        return '✓';
      case HealthStatus.fair:
        return '⚠';
      case HealthStatus.concerning:
        return '✗';
      default:
        return '?';
    }
  }

  @override
  bool shouldRepaint(covariant _AIOverlayPainter oldDelegate) {
    return objectDetections != oldDelegate.objectDetections ||
        breedInfo != oldDelegate.breedInfo ||
        activityResult != oldDelegate.activityResult ||
        healthAssessment != oldDelegate.healthAssessment;
  }
}
