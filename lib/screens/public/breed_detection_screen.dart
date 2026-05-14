import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/breed_info.dart';
import '../../services/breed_classifier.dart';
import '../../widgets/ai_info_card.dart';
import '../../widgets/custom_app_bar.dart';

class BreedDetectionScreen extends StatefulWidget {
  const BreedDetectionScreen({super.key});

  @override
  State<BreedDetectionScreen> createState() => _BreedDetectionScreenState();
}

class _BreedDetectionScreenState extends State<BreedDetectionScreen> {
  final BreedClassifierService _breedClassifier = BreedClassifierService();
  final ImagePicker _picker = ImagePicker();

  bool _isLoading = true;
  String _status = 'Initializing...';
  File? _selectedImage;
  BreedInfo? _breedResult;

  @override
  void initState() {
    super.initState();
    _initializeClassifier();
  }

  Future<void> _initializeClassifier() async {
    setState(() {
      _status = 'Loading breed classifier...';
      _isLoading = true;
    });

    try {
      await _breedClassifier.loadModel();
      setState(() {
        _status = 'Ready! Select an image to identify breed';
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error initializing: $e');
      setState(() {
        _status = 'Ready with basic detection';
        _isLoading = false;
      });
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(source: source);
      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _breedResult = null;
          _status = 'Analyzing breed...';
        });

        await Future.delayed(const Duration(milliseconds: 100));
        await _classifyBreed();
      }
    } catch (e) {
      setState(() {
        _status = 'Error picking image: $e';
      });
    }
  }

  Future<void> _classifyBreed() async {
    if (_selectedImage == null) return;

    try {
      final result = await _breedClassifier.classifyBreed(_selectedImage!);
      
      setState(() {
        _breedResult = result;
        _status = result != null 
            ? 'Breed identified!'
            : 'Could not identify breed. Try another image.';
      });
    } catch (e) {
      debugPrint('Classification error: $e');
      setState(() {
        _status = 'Error analyzing breed: $e';
      });
    }
  }

  @override
  void dispose() {
    _breedClassifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Breed Detection',
        leadingIcon: Icons.pets,
      ),
      body: Column(
        children: [
          // Status Bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              border: Border(
                bottom: BorderSide(
                  color: Theme.of(context).dividerColor,
                ),
              ),
            ),
            child: Row(
              children: [
                if (_isLoading)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                else
                  Icon(
                    _breedResult != null
                        ? Icons.check_circle
                        : Icons.info_outline,
                    color: _breedResult != null ? Colors.green : Colors.grey,
                  ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _status,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Image Display
                  if (_selectedImage != null)
                    Container(
                      margin: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.file(
                          _selectedImage!,
                          width: double.infinity,
                          height: 300,
                          fit: BoxFit.cover,
                        ),
                      ),
                    )
                  else
                    Container(
                      margin: const EdgeInsets.all(16),
                      height: 250,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.grey[400]!,
                          width: 2,
                          style: BorderStyle.solid,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.pets, size: 80, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          Text(
                            'Select an image to identify breed',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Breed Result
                  if (_breedResult != null) ...[
                    AIInfoCard(
                      title: _breedResult!.breedName,
                      icon: _breedResult!.isDog ? Icons.pets : Icons.pets,
                      iconColor: _breedResult!.isDog ? Colors.green : Colors.orange,
                      children: [
                        AIInfoRow(
                          label: 'Species',
                          value: _breedResult!.species.toUpperCase(),
                          icon: Icons.category,
                        ),
                        AIInfoRow(
                          label: 'Confidence',
                          value: '${(_breedResult!.confidence * 100).toStringAsFixed(1)}%',
                          icon: Icons.analytics,
                          valueColor: _breedResult!.isHighConfidence
                              ? Colors.green
                              : Colors.orange,
                        ),
                        if (_breedResult!.size != null) ...[
                          const SizedBox(height: 8),
                          AIInfoRow(
                            label: 'Size',
                            value: _breedResult!.size!,
                            icon: Icons.straighten,
                          ),
                        ],
                        if (_breedResult!.origin != null)
                          AIInfoRow(
                            label: 'Origin',
                            value: _breedResult!.origin!,
                            icon: Icons.public,
                          ),
                        if (_breedResult!.temperament != null) ...[
                          const SizedBox(height: 16),
                          const Divider(),
                          const SizedBox(height: 8),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.mood, size: 18, color: Colors.blue),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Temperament',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _breedResult!.temperament!,
                                      style: const TextStyle(fontSize: 14),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                        if (_breedResult!.characteristics != null) ...[
                          const SizedBox(height: 16),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.star, size: 18, color: Colors.amber),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Characteristics',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _breedResult!.characteristics!,
                                      style: const TextStyle(fontSize: 14),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ],

                  const SizedBox(height: 16),

                  // Instructions
                  if (_selectedImage == null)
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Card(
                        color: Colors.blue[50],
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: const [
                              Icon(Icons.info, color: Colors.blue, size: 32),
                              SizedBox(height: 12),
                              Text(
                                'Tips for Best Results',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              SizedBox(height: 8),
                              Text(
                                '• Use clear, well-lit photos\n'
                                '• Photograph the pet from the side or front\n'
                                '• Avoid blurry or distant images\n'
                                '• Focus on the pet\'s face and body',
                                style: TextStyle(fontSize: 14),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                  const SizedBox(height: 80), // Space for FAB
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton(
            heroTag: 'camera',
            onPressed: () => _pickImage(ImageSource.camera),
            backgroundColor: Colors.green,
            child: const Icon(Icons.camera_alt),
          ),
          const SizedBox(height: 16),
          FloatingActionButton(
            heroTag: 'gallery',
            onPressed: () => _pickImage(ImageSource.gallery),
            backgroundColor: Colors.blue,
            child: const Icon(Icons.photo_library),
          ),
        ],
      ),
    );
  }
}
