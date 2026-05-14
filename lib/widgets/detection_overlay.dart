import 'package:flutter/material.dart';
import '../models/ai_detection_result.dart';

/// Real-time detection overlay for camera feeds
class DetectionOverlay extends StatelessWidget {
  final List<AIDetectionResult> detections;
  final bool showFps;
  final double fps;
  final bool showStats;

  const DetectionOverlay({
    super.key,
    required this.detections,
    this.showFps = true,
    this.fps = 0.0,
    this.showStats = true,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Top stats banner
        if (showStats)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.7),
                    Colors.transparent,
                  ],
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatChip(
                    icon: Icons.pets,
                    label: '${detections.where((d) => d.isPet).length} Pets',
                    color: Colors.green,
                  ),
                  if (showFps)
                    _buildStatChip(
                      icon: Icons.speed,
                      label: '${fps.toStringAsFixed(1)} FPS',
                      color: _getFpsColor(fps),
                    ),
                  _buildStatChip(
                    icon: Icons.visibility,
                    label: '${detections.length} Objects',
                    color: Colors.blue,
                  ),
                ],
              ),
            ),
          ),

        // Detection list at bottom
        if (detections.isNotEmpty)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              constraints: const BoxConstraints(maxHeight: 150),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.black.withOpacity(0.8),
                    Colors.transparent,
                  ],
                ),
              ),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: detections.length,
                itemBuilder: (context, index) {
                  final detection = detections[index];
                  return _buildDetectionItem(detection);
                },
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildStatChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.6), width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetectionItem(AIDetectionResult detection) {
    final color = detection.isPet ? Colors.green : Colors.grey;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5), width: 2),
      ),
      child: Row(
        children: [
          Icon(
            detection.isDog ? Icons.pets : detection.isCat ? Icons.pets : Icons.category,
            color: color,
            size: 20,
          ),
          const SizedBox(width:12),
          Expanded(
            child: Text(
              detection.label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.3),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${(detection.confidence * 100).toStringAsFixed(0)}%',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getFpsColor(double fps) {
    if (fps >= 25) return Colors.green;
    if (fps >= 15) return Colors.orange;
    return Colors.red;
  }
}
