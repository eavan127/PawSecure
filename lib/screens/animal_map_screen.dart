import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class AnimalMapScreen extends StatefulWidget {
  const AnimalMapScreen({super.key});

  @override
  State<AnimalMapScreen> createState() => _AnimalMapScreenState();
}

class _AnimalMapScreenState extends State<AnimalMapScreen> {
  final Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _loadMarkers();
  }

  Future<void> _loadMarkers() async {
    final snapshot =
        await FirebaseFirestore.instance.collection('animals').get();

    final markers = snapshot.docs.map((doc) {
      final data = doc.data();

      // 🔑 USE lastSeen
      final lastSeen = data['lastSeen'];
      if (lastSeen == null) return null;

      final lat = lastSeen['lat'];
      final lng = lastSeen['lng'];
      final species = data['species'] ?? 'Animal';

      return Marker(
        markerId: MarkerId(doc.id),
        position: LatLng(lat, lng),
        infoWindow: InfoWindow(
          title: species,
          snippet: data['status'] ?? '',
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          BitmapDescriptor.hueOrange,
        ),
      );
    }).whereType<Marker>().toSet();

    setState(() {
      _markers.addAll(markers);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Animal Map')),
      body: GoogleMap(
        initialCameraPosition: const CameraPosition(
          target: LatLng(3.140853, 101.693207), // KL
          zoom: 13,
        ),
        markers: _markers,
      ),
    );
  }
}
