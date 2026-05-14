import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  static const LatLng _center = LatLng(3.140853, 101.693207); // KL

  final Set<Marker> _markers = {
    const Marker(
      markerId: MarkerId('dog1'),
      position: LatLng(3.140853, 101.693207),
      infoWindow: InfoWindow(title: 'Dog detected'),
    ),
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PawGuard AI Map')),
      body: GoogleMap(
        initialCameraPosition: const CameraPosition(
          target: _center,
          zoom: 15,
        ),
        markers: _markers,
        myLocationEnabled: true,
      ),
    );
  }
}
