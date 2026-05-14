import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';

/// Performance monitoring utility for AI operations
class PerformanceMonitor {
  // Metrics storage
  final List<PerformanceMetric> _metrics = [];
  DateTime? _sessionStart;

  // Real-time tracking
  int _totalFrames = 0;
  int _droppedFrames = 0;
  Duration _totalInferenceTime = Duration.zero;
  int _inferenceCount = 0;

  // Memory tracking
  List<int> _memorySamples = [];

  bool get isActive => _sessionStart != null;

  /// Start a new monitoring session
  void startSession() {
    _sessionStart = DateTime.now();
    _metrics.clear();
    _totalFrames = 0;
    _droppedFrames = 0;
    _totalInferenceTime = Duration.zero;
    _inferenceCount = 0;
    _memorySamples.clear();
    
    debugPrint('📊 Performance monitoring started');
  }

  /// End current monitoring session
  PerformanceReport endSession() {
    if (_sessionStart == null) {
      throw Exception('No active session to end');
    }

    final duration = DateTime.now().difference(_sessionStart!);
    final report = PerformanceReport(
      sessionStart: _sessionStart!,
      sessionDuration: duration,
      metrics: List.from(_metrics),
      totalFrames: _totalFrames,
      droppedFrames: _droppedFrames,
      avgInferenceTime: _inferenceCount > 0
          ? Duration(microseconds: _totalInferenceTime.inMicroseconds ~/ _inferenceCount)
          : Duration.zero,
      avgMemoryUsage: _memorySamples.isNotEmpty
          ? _memorySamples.reduce((a, b) => a + b) ~/ _memorySamples.length
          : 0,
      peakMemoryUsage: _memorySamples.isNotEmpty 
          ? _memorySamples.reduce((a, b) => a > b ? a : b)
          : 0,
    );

    _sessionStart = null;
    debugPrint('📊 Performance monitoring ended');
    
    return report;
  }

  /// Record a frame
  void recordFrame({bool dropped = false}) {
    if (!isActive) return;

    _totalFrames++;
    if (dropped) _droppedFrames++;
  }

  /// Record inference time
  void recordInference(Duration inferenceTime, String modelName) {
    if (!isActive) return;

    _totalInferenceTime += inferenceTime;
    _inferenceCount++;

    _metrics.add(PerformanceMetric(
      timestamp: DateTime.now(),
      type: MetricType.inference,
      value: inferenceTime.inMilliseconds.toDouble(),
      label: modelName,
    ));
  }

  /// Record memory usage (in bytes)
  void recordMemoryUsage(int bytes) {
    if (!isActive) return;

    _memorySamples.add(bytes);

    _metrics.add(PerformanceMetric(
      timestamp: DateTime.now(),
      type: MetricType.memory,
      value: (bytes / 1024 / 1024).toDouble(), // Convert to MB
      label: 'Memory',
    ));
  }

  /// Record FPS
  void recordFPS(int fps) {
    if (!isActive) return;

    _metrics.add(PerformanceMetric(
      timestamp: DateTime.now(),
      type: MetricType.fps,
      value: fps.toDouble(),
      label: 'FPS',
    ));
  }

  /// Record custom metric
  void recordCustom(String label, double value) {
    if (!isActive) return;

    _metrics.add(PerformanceMetric(
      timestamp: DateTime.now(),
      type: MetricType.custom,
      value: value,
      label: label,
    ));
  }

  /// Get current session statistics
  Map<String, dynamic> getCurrentStats() {
    if (!isActive) return {};

    final duration = DateTime.now().difference(_sessionStart!);
    final fps = duration.inSeconds > 0 ? _totalFrames / duration.inSeconds : 0;

    return {
      'sessionDuration': duration.inSeconds,
      'totalFrames': _totalFrames,
      'droppedFrames': _droppedFrames,
      'fps': fps.toStringAsFixed(1),
      'avgInferenceMs': _inferenceCount > 0
          ? (_totalInferenceTime.inMilliseconds / _inferenceCount).toStringAsFixed(1)
          : '0',
      'inferenceCount': _inferenceCount,
      'avgMemoryMB': _memorySamples.isNotEmpty
          ? (_memorySamples.reduce((a, b) => a + b) / _memorySamples.length / 1024 / 1024)
              .toStringAsFixed(1)
          : '0',
    };
  }
}

/// Performance metric data point
class PerformanceMetric {
  final DateTime timestamp;
  final MetricType type;
  final double value;
  final String label;

  PerformanceMetric({
    required this.timestamp,
    required this.type,
    required this.value,
    required this.label,
  });

  Map<String, dynamic> toJson() => {
    'timestamp': timestamp.toIso8601String(),
    'type': type.name,
    'value': value,
    'label': label,
  };
}

enum MetricType {
  fps,
  inference,
  memory,
  custom,
}

/// Performance report
class PerformanceReport {
  final DateTime sessionStart;
  final Duration sessionDuration;
  final List<PerformanceMetric> metrics;
  final int totalFrames;
  final int droppedFrames;
  final Duration avgInferenceTime;
  final int avgMemoryUsage;
  final int peakMemoryUsage;

  PerformanceReport({
    required this.sessionStart,
    required this.sessionDuration,
    required this.metrics,
    required this.totalFrames,
    required this.droppedFrames,
    required this.avgInferenceTime,
    required this.avgMemoryUsage,
    required this.peakMemoryUsage,
  });

  double get fps => sessionDuration.inSeconds > 0
      ? totalFrames / sessionDuration.inSeconds
      : 0;

  double get dropRate => totalFrames > 0
      ? (droppedFrames / totalFrames) * 100
      : 0;

  /// Export report as CSV
  String toCSV() {
    final buffer = StringBuffer();
    
    // Header
    buffer.writeln('Timestamp,Type,Value,Label');
    
    // Data rows
    for (final metric in metrics) {
      buffer.writeln(
        '${metric.timestamp.toIso8601String()},'
        '${metric.type.name},'
        '${metric.value},'
        '${metric.label}'
      );
    }
    
    return buffer.toString();
  }

  /// Export report as formatted text
  String toText() {
    final buffer = StringBuffer();
    
    buffer.writeln('=== Performance Report ===');
    buffer.writeln('Session Start: ${sessionStart.toString()}');
    buffer.writeln('Duration: ${sessionDuration.inSeconds}s');
    buffer.writeln('');
    
    buffer.writeln('Frame Statistics:');
    buffer.writeln('  Total Frames: $totalFrames');
    buffer.writeln('  Dropped Frames: $droppedFrames');
    buffer.writeln('  Drop Rate: ${dropRate.toStringAsFixed(2)}%');
    buffer.writeln('  Average FPS: ${fps.toStringAsFixed(1)}');
    buffer.writeln('');
    
    buffer.writeln('Inference Statistics:');
    buffer.writeln('  Average Time: ${avgInferenceTime.inMilliseconds}ms');
    buffer.writeln('');
    
    buffer.writeln('Memory Statistics:');
    buffer.writeln('  Average: ${(avgMemoryUsage / 1024 / 1024).toStringAsFixed(1)} MB');
    buffer.writeln('  Peak: ${(peakMemoryUsage / 1024 / 1024).toStringAsFixed(1)} MB');
    buffer.writeln('');
    
    buffer.writeln('Total Metrics Captured: ${metrics.length}');
    
    return buffer.toString();
  }

  /// Save report to file
  Future<File> saveToFile(String directory, {String? filename}) async {
    final name = filename ?? 'performance_report_${DateTime.now().millisecondsSinceEpoch}.csv';
    final file = File('$directory/$name');
    
    await file.writeAsString(toCSV());
    debugPrint('📝 Performance report saved to: ${file.path}');
    
    return file;
  }

  Map<String, dynamic> toJson() => {
    'session_start': sessionStart.toIso8601String(),
    'session_duration_s': sessionDuration.inSeconds,
    'total_frames': totalFrames,
    'dropped_frames': droppedFrames,
    'drop_rate': dropRate,
    'fps': fps,
    'avg_inference_ms': avgInferenceTime.inMilliseconds,
    'avg_memory_mb': avgMemoryUsage / 1024 / 1024,
    'peak_memory_mb': peakMemoryUsage / 1024 / 1024,
    'metrics_count': metrics.length,
  };
}
