import 'package:flutter/material.dart';

/// Widget to display real-time AI detection statistics
class DetectionStatsWidget extends StatelessWidget {
  final int fps;
  final int detectionCount;
  final Duration? processingLatency;
  final bool modelLoaded;
  final String? currentModel;
  final Map<String, bool> modelStatus;

  const DetectionStatsWidget({
    super.key,
    this.fps = 0,
    this.detectionCount = 0,
    this.processingLatency,
    this.modelLoaded = false,
    this.currentModel,
    this.modelStatus = const {},
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.6),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Row(
            children: [
              Icon(
                Icons.analytics_outlined,
                color: Colors.white.withOpacity(0.9),
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                'AI Statistics',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // FPS
          _StatRow(
            icon: Icons.speed,
            label: 'FPS',
            value: fps.toString(),
            color: fps > 15 ? Colors.greenAccent : Colors.orange,
          ),

          const SizedBox(height: 8),

          // Detection count
          _StatRow(
            icon: Icons.pets,
            label: 'Detections',
            value: detectionCount.toString(),
            color: Colors.blueAccent,
          ),

          const SizedBox(height: 8),

          // Processing time
          _StatRow(
            icon: Icons.timer_outlined,
            label: 'Latency',
            value: processingLatency != null 
                ? '${processingLatency!.inMilliseconds}ms'
                : 'N/A',
            color: _getLatencyColor(processingLatency),
          ),

          const SizedBox(height: 12),
          Divider(color: Colors.white.withOpacity(0.2), height: 1),
          const SizedBox(height: 12),

          // Model status
          Text(
            'Models',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),

          ...modelStatus.entries.map((entry) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Icon(
                  entry.value ? Icons.check_circle : Icons.cancel,
                  color: entry.value ? Colors.greenAccent : Colors.redAccent,
                  size: 14,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    entry.key,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 11,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Color _getLatencyColor(Duration? latency) {
    if (latency == null) return Colors.grey;
    if (latency.inMilliseconds < 100) return Colors.greenAccent;
    if (latency.inMilliseconds < 200) return Colors.yellowAccent;
    return Colors.redAccent;
  }
}

class _StatRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: 12,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
