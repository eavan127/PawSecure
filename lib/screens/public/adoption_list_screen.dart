import 'package:flutter/material.dart';
import '../../models/breed_info.dart';
import '../../models/health_assessment.dart';
import '../../models/activity_result.dart';
import '../../widgets/pet_card_widget.dart';

class AdoptionListScreen extends StatefulWidget {
  const AdoptionListScreen({super.key});

  @override
  State<AdoptionListScreen> createState() => _AdoptionListScreenState();
}

class _AdoptionListScreenState extends State<AdoptionListScreen> {
  // Filter states
  String _selectedSpecies = 'All';
  String _selectedSize = 'All';
  HealthStatus? _minHealthStatus;
  bool _showAIVerifiedOnly = false;

  // Sample data (replace with actual Firestore data)
  final List<Map<String, dynamic>> _samplePets = [
    {
      'name': 'Max',
      'age': '2 years',
      'location': 'Manila Animal Shelter',
      'imageUrl': null,
      'breedInfo': BreedInfo(
        breedName: 'Golden Retriever',
        species: 'dog',
        confidence: 0.92,
        size: 'Large',
        temperament: 'Friendly, Intelligent',
      ),
      'healthAssessment': HealthAssessment(
        overallScore: 0.95,
        skinCondition: 0.98,
        status: HealthStatus.good,
      ),
      'activityResult': ActivityResult(
        activity: PetActivity.playing,
        confidence: 0.87,
      ),
    },
    {
      'name': 'Luna',
      'age': '1 year',
      'location': 'Quezon City Rescue',
      'imageUrl': null,
      'breedInfo': BreedInfo(
        breedName: 'Siamese',
        species: 'cat',
        confidence: 0.89,
        size: 'Medium',
        temperament: 'Affectionate, Vocal',
      ),
      'healthAssessment': HealthAssessment(
        overallScore: 0.88,
        skinCondition: 0.85,
        status: HealthStatus.good,
      ),
      'activityResult': ActivityResult(
        activity: PetActivity.sitting,
        confidence: 0.76,
      ),
    },
    {
      'name': 'Buddy',
      'age': '3 years',
      'location': 'Makati Pet Haven',
      'imageUrl': null,
      'breedInfo': BreedInfo(
        breedName: 'Labrador',
        species: 'dog',
        confidence: 0.85,
        size: 'Large',
        temperament: 'Friendly, Active',
      ),
      'healthAssessment': HealthAssessment(
        overallScore: 0.75,
        skinCondition: 0.72,
        status: HealthStatus.fair,
      ),
      'activityResult': ActivityResult(
        activity: PetActivity.walking,
        confidence: 0.82,
      ),
    },
  ];

  List<Map<String, dynamic>> get _filteredPets {
    return _samplePets.where((pet) {
      // Species filter
      if (_selectedSpecies != 'All') {
        final breedInfo = pet['breedInfo'] as BreedInfo?;
        if (breedInfo == null || 
            breedInfo.species.toLowerCase() != _selectedSpecies.toLowerCase()) {
          return false;
        }
      }

      // Size filter
      if (_selectedSize != 'All') {
        final breedInfo = pet['breedInfo'] as BreedInfo?;
        if (breedInfo == null || breedInfo.size != _selectedSize) {
          return false;
        }
      }

      // Health filter
      if (_minHealthStatus != null) {
        final health = pet['healthAssessment'] as HealthAssessment?;
        if (health == null || !_meetsHealthRequirement(health.status)) {
          return false;
        }
      }

      // AI verified filter
      if (_showAIVerifiedOnly) {
        final breedInfo = pet['breedInfo'] as BreedInfo?;
        if (breedInfo == null || breedInfo.confidence < 0.8) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  bool _meetsHealthRequirement(HealthStatus status) {
    if (_minHealthStatus == null) return true;
    
    final statusOrder = {
      HealthStatus.concerning: 0,
      HealthStatus.fair: 1,
      HealthStatus.good: 2,
    };

    return (statusOrder[status] ?? 0) >= (statusOrder[_minHealthStatus] ?? 0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Adopt a Pet'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Active filters chips
          if (_hasActiveFilters()) _buildActiveFiltersBar(),

          // Pet grid
          Expanded(
            child: _filteredPets.isEmpty
                ? _buildEmptyState()
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.75,
                    ),
                    itemCount: _filteredPets.length,
                    itemBuilder: (context, index) {
                      final pet = _filteredPets[index];
                      return PetCardWidget(
                        petName: pet['name'],
                        age: pet['age'],
                        location: pet['location'],
                        imageUrl: pet['imageUrl'],
                        breedInfo: pet['breedInfo'],
                        healthAssessment: pet['healthAssessment'],
                        activityResult: pet['activityResult'],
                        onTap: () => _showPetDetails(pet),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  bool _hasActiveFilters() {
    return _selectedSpecies != 'All' ||
        _selectedSize != 'All' ||
        _minHealthStatus != null ||
        _showAIVerifiedOnly;
  }

  Widget _buildActiveFiltersBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.grey[100],
      child: Row(
        children: [
          Expanded(
            child: Wrap(
              spacing: 8,
              runSpacing: 4,
              children: [
                if (_selectedSpecies != 'All')
                  _buildFilterChip(_selectedSpecies, () {
                    setState(() => _selectedSpecies = 'All');
                  }),
                if (_selectedSize != 'All')
                  _buildFilterChip('Size: $_selectedSize', () {
                    setState(() => _selectedSize = 'All');
                  }),
                if (_minHealthStatus != null)
                  _buildFilterChip('Health: ${_minHealthStatus!.name}', () {
                    setState(() => _minHealthStatus = null);
                  }),
                if (_showAIVerifiedOnly)
                  _buildFilterChip('AI Verified', () {
                    setState(() => _showAIVerifiedOnly = false);
                  }),
              ],
            ),
          ),
          TextButton(
            onPressed: _clearAllFilters,
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, VoidCallback onRemove) {
    return Chip(
      label: Text(label, style: const TextStyle(fontSize: 12)),
      onDeleted: onRemove,
      deleteIconColor: Colors.grey[600],
      backgroundColor: Colors.white,
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.pets_outlined, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No pets found',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your filters',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[500],
                ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _clearAllFilters,
            child: const Text('Clear Filters'),
          ),
        ],
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => _buildFilterContent(scrollController),
      ),
    );
  }

  Widget _buildFilterContent(ScrollController scrollController) {
    return StatefulBuilder(
      builder: (context, setModalState) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: ListView(
            controller: scrollController,
            children: [
              // Header
              Row(
                children: [
                  const Text(
                    'Filter Pets',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const Divider(),
              const SizedBox(height: 16),

              // Species filter
              const Text('Species', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['All', 'Dog', 'Cat'].map((species) {
                  return ChoiceChip(
                    label: Text(species),
                    selected: _selectedSpecies == species,
                    onSelected: (selected) {
                      setModalState(() => _selectedSpecies = species);
                      setState(() => _selectedSpecies = species);
                    },
                  );
                }).toList(),
              ),

              const SizedBox(height: 24),

              // Size filter
              const Text('Size', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['All', 'Small', 'Medium', 'Large'].map((size) {
                  return ChoiceChip(
                    label: Text(size),
                    selected: _selectedSize == size,
                    onSelected: (selected) {
                      setModalState(() => _selectedSize = size);
                      setState(() => _selectedSize = size);
                    },
                  );
                }).toList(),
              ),

              const SizedBox(height: 24),

              // Health filter
              const Text('Minimum Health', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [null, HealthStatus.concerning, HealthStatus.fair, HealthStatus.good]
                    .map((status) {
                  return ChoiceChip(
                    label: Text(status?.name ?? 'Any'),
                    selected: _minHealthStatus == status,
                    onSelected: (selected) {
                      setModalState(() => _minHealthStatus = status);
                      setState(() => _minHealthStatus = status);
                    },
                  );
                }).toList(),
              ),

              const SizedBox(height: 24),

              // AI verified toggle
              SwitchListTile(
                title: const Text('AI Verified Only'),
                subtitle: const Text('Show only pets with high confidence AI analysis'),
                value: _showAIVerifiedOnly,
                onChanged: (value) {
                  setModalState(() => _showAIVerifiedOnly = value);
                  setState(() => _showAIVerifiedOnly = value);
                },
              ),

              const SizedBox(height: 24),

              // Apply button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: Text('Show ${_filteredPets.length} Pets'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _clearAllFilters() {
    setState(() {
      _selectedSpecies = 'All';
      _selectedSize = 'All';
      _minHealthStatus = null;
      _showAIVerifiedOnly = false;
    });
  }

  void _showPetDetails(Map<String, dynamic> pet) {
    // Navigate to detail screen
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Opening details for ${pet['name']}')),
    );
    // TODO: Navigate to adoption detail screen
  }
}
