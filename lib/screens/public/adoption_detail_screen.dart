import 'package:flutter/material.dart';

class AdoptionDetailScreen extends StatelessWidget {
  final String animalId;
  
  const AdoptionDetailScreen({super.key, required this.animalId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Adoption Detail Screen: $animalId')),
    );
  }
}
