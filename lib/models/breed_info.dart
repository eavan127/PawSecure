class BreedInfo {
  final String breedName;
  final String species; // 'dog' or 'cat'
  final double confidence;
  final String? characteristics;
  final String? temperament;
  final String? size;
  final String? origin;
  final String? imageUrl;

  BreedInfo({
    required this.breedName,
    required this.species,
    required this.confidence,
    this.characteristics,
    this.temperament,
    this.size,
    this.origin,
    this.imageUrl,
  });

  bool get isDog => species.toLowerCase() == 'dog';
  bool get isCat => species.toLowerCase() == 'cat';
  bool get isHighConfidence => confidence > 0.7;

  Map<String, dynamic> toJson() => {
        'breedName': breedName,
        'species': species,
        'confidence': confidence,
        'characteristics': characteristics,
        'temperament': temperament,
        'size': size,
        'origin': origin,
        'imageUrl': imageUrl,
      };

  factory BreedInfo.fromJson(Map<String, dynamic> json) => BreedInfo(
        breedName: json['breedName'] as String,
        species: json['species'] as String,
        confidence: json['confidence'] as double,
        characteristics: json['characteristics'] as String?,
        temperament: json['temperament'] as String?,
        size: json['size'] as String?,
        origin: json['origin'] as String?,
        imageUrl: json['imageUrl'] as String?,
      );

  @override
  String toString() =>
      'BreedInfo(breed: $breedName, species: $species, confidence: ${(confidence * 100).toStringAsFixed(1)}%)';
}

/// Detailed breed data with care information
class DetailedBreedInfo extends BreedInfo {
  final String description;
  final List<String> careRequirements;
  final String exerciseNeeds;
  final String groomingNeeds;
  final List<String> commonHealthIssues;
  final String lifespan;
  final bool goodWithChildren;
  final bool goodWithPets;

  DetailedBreedInfo({
    required super.breedName,
    required super.species,
    required super.confidence,
    required this.description,
    required this.careRequirements,
    required this.exerciseNeeds,
    required this.groomingNeeds,
    required this.commonHealthIssues,
    required this.lifespan,
    required this.goodWithChildren,
    required this.goodWithPets,
    super.characteristics,
    super.temperament,
    super.size,
    super.origin,
    super.imageUrl,
  });

  @override
  Map<String, dynamic> toJson() => {
        ...super.toJson(),
        'description': description,
        'careRequirements': careRequirements,
        'exerciseNeeds': exerciseNeeds,
        'groomingNeeds': groomingNeeds,
        'commonHealthIssues': commonHealthIssues,
        'lifespan': lifespan,
        'goodWithChildren': goodWithChildren,
        'goodWithPets': goodWithPets,
      };

  factory DetailedBreedInfo.fromJson(Map<String, dynamic> json) =>
      DetailedBreedInfo(
        breedName: json['breedName'] as String,
        species: json['species'] as String,
        confidence: json['confidence'] as double,
        description: json['description'] as String,
        careRequirements: (json['careRequirements'] as List<dynamic>)
            .map((e) => e as String)
            .toList(),
        exerciseNeeds: json['exerciseNeeds'] as String,
        groomingNeeds: json['groomingNeeds'] as String,
        commonHealthIssues: (json['commonHealthIssues'] as List<dynamic>)
            .map((e) => e as String)
            .toList(),
        lifespan: json['lifespan'] as String,
        goodWithChildren: json['goodWithChildren'] as bool,
        goodWithPets: json['goodWithPets'] as bool,
        characteristics: json['characteristics'] as String?,
        temperament: json['temperament'] as String?,
        size: json['size'] as String?,
        origin: json['origin'] as String?,
        imageUrl: json['imageUrl'] as String?,
      );
}
