import 'package:flutter/material.dart';

class AdoptionFlowScreen extends StatelessWidget {
  final String animalId;
  
  const AdoptionFlowScreen({super.key, required this.animalId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Adoption Flow Screen: $animalId')),
    );
  }
}
