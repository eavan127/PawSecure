import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';

class CctvSimulator {
  Timer? _timer;

  void start() {
    _timer = Timer.periodic(const Duration(seconds: 10), (_) async {
      await _simulateDetection();
    });
  }

  void stop() {
    _timer?.cancel();
  }

  Future<void> _simulateDetection() async {
    final detectedSpecies = _aiDetectSpecies();

    if (detectedSpecies == 'none') return;

    await FirebaseFirestore.instance.collection('animals').add({
      'species': detectedSpecies,
      'status': 'normal',
      'verifiedByNGO': false,
      'createdAt': FieldValue.serverTimestamp(),
      'health': {
        'vaccinated': false,
        'neutered': false,
      },
      'lastSeen': {
        'lat': 3.140853,
        'lng': 101.693207,
        'timestamp': FieldValue.serverTimestamp(),
      },
    });
  }

  String _aiDetectSpecies() {
    final second = DateTime.now().second;

    if (second % 3 == 0) return 'dog';
    if (second % 3 == 1) return 'cat';
    return 'none';
  }
}
