import 'package:flutter/material.dart';
import '../models/ai_detection_result.dart';

class BoundingBoxPainter extends CustomPainter {
  final List<AIDetectionResult> detections;
  final Size imageSize;
  final bool showLabels;
  final bool showConfidence;

  BoundingBoxPainter({
    required this.detections,
    required this.imageSize,
    this.showLabels = true,
    this.showConfidence = true,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (detections.isEmpty) return;

    // Calculate scale factors
    final scaleX = size.width / imageSize.width;
    final scaleY = size.height / imageSize.height;

    for (final detection in detections) {
      final box = detection.box;

      // Scale bounding box coordinates
      final left = box.left * scaleX;
      final top = box.top * scaleY;
      final right = box.right * scaleX;
      final bottom = box.bottom * scaleY;

      // Choose color based on label
      final color = _getColorForLabel(detection.label);

      // Draw bounding box
      final paint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0;

      final rect = Rect.fromLTRB(left, top, right, bottom);
      canvas.drawRect(rect, paint);

      // Draw background for label
      if (showLabels) {
        final labelText = showConfidence
            ? '${detection.label} ${(detection.confidence * 100).toStringAsFixed(0)}%'
            : detection.label;

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

        // Draw label background
        final labelRect = Rect.fromLTWH(
          left,
          top - textPainter.height - 8,
          textPainter.width + 16,
          textPainter.height + 8,
        );

        final backgroundPaint = Paint()
          ..color = color
          ..style = PaintingStyle.fill;

        canvas.drawRect(labelRect, backgroundPaint);

        // Draw label text
        textPainter.paint(
          canvas,
          Offset(left + 8, top - textPainter.height - 4),
        );
      }

      // Draw confidence indicator (corner dots)
      if (detection.confidence > 0.7) {
        final cornerPaint = Paint()
          ..color = Colors.green
          ..style = PaintingStyle.fill;

        // Top-left corner
        canvas.drawCircle(Offset(left, top), 4, cornerPaint);
        // Top-right corner
        canvas.drawCircle(Offset(right, top), 4, cornerPaint);
        // Bottom-left corner
        canvas.drawCircle(Offset(left, bottom), 4, cornerPaint);
        // Bottom-right corner
        canvas.drawCircle(Offset(right, bottom), 4, cornerPaint);
      }
    }
  }

  Color _getColorForLabel(String label) {
    final lowerLabel = label.toLowerCase();

    if (lowerLabel == 'dog') {
      return Colors.green;
    } else if (lowerLabel == 'cat') {
      return Colors.orange;
    } else if (lowerLabel == 'person') {
      return Colors.blue;
    } else {
      return Colors.purple;
    }
  }

  @override
  bool shouldRepaint(BoundingBoxPainter oldDelegate) {
    return detections != oldDelegate.detections ||
        imageSize != oldDelegate.imageSize;
  }
}

/// Widget that overlays bounding boxes on an image or camera feed
class BoundingBoxOverlay extends StatelessWidget {
  final List<AIDetectionResult> detections;
  final Size imageSize;
  final Widget child;
  final bool showLabels;
  final bool showConfidence;

  const BoundingBoxOverlay({
    super.key,
    required this.detections,
    required this.imageSize,
    required this.child,
    this.showLabels = true,
    this.showConfidence = true,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        child,
        CustomPaint(
          painter: BoundingBoxPainter(
            detections: detections,
            imageSize: imageSize,
            showLabels: showLabels,
            showConfidence: showConfidence,
          ),
        ),
      ],
    );
  }
}
