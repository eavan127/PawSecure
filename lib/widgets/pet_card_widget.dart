import 'package:flutter/material.dart';
import '../models/breed_info.dart';
import '../models/health_assessment.dart';
import '../models/activity_result.dart';

/// Rich pet card widget with AI highlights
class PetCardWidget extends StatelessWidget {
  final String petName;
  final String? imageUrl;
  final BreedInfo? breedInfo;
  final HealthAssessment? healthAssessment;
  final ActivityResult? activityResult;
  final String? location;
  final String age;
  final VoidCallback? onTap;

  const PetCardWidget({
    super.key,
    required this.petName,
    this.imageUrl,
    this.breedInfo,
    this.healthAssessment,
    this.activityResult,
    this.location,
    required this.age,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with AI badges overlay
            Stack(
              children: [
                // Pet image
                AspectRatio(
                  aspectRatio: 4 / 3,
                  child: imageUrl != null
                      ? Image.network(
                          imageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              _buildPlaceholderImage(),
                        )
                      : _buildPlaceholderImage(),
                ),

                // AI Badge overlays
                Positioned(
                  top: 8,
                  left: 8,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Breed badge
                      if (breedInfo != null) _buildBreedBadge(),
                      if (breedInfo != null) const SizedBox(height: 4),

                      // Health badge
                      if (healthAssessment != null) _buildHealthBadge(),
                    ],
                  ),
                ),

                // Activity badge
                if (activityResult != null)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: _buildActivityBadge(),
                  ),

                // Confidence indicator
                if (breedInfo != null && breedInfo!.confidence > 0.8)
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.verified,
                            size: 14,
                            color: Colors.white,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'AI Verified',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),

            // Pet details
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name and age
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          petName,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          age,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Location
                  if (location != null)
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 16,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            location!,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[600],
                                ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                  const SizedBox(height: 8),

                  // AI insights row
                  if (breedInfo != null || healthAssessment != null)
                    _buildInsightsRow(context),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      color: Colors.grey[300],
      child: Center(
        child: Icon(
          Icons.pets,
          size: 64,
          color: Colors.grey[500],
        ),
      ),
    );
  }

  Widget _buildBreedBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: breedInfo!.species.toLowerCase() == 'dog'
            ? Colors.orange.withOpacity(0.9)
            : Colors.purple.withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            breedInfo!.species.toLowerCase() == 'dog'
                ? Icons.pets
                : Icons.pets_outlined,
            size: 14,
            color: Colors.white,
          ),
          const SizedBox(width: 4),
          Text(
            breedInfo!.breedName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHealthBadge() {
    final status = healthAssessment!.status;
    final color = _getHealthColor(status);
    final icon = _getHealthIcon(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            '${(healthAssessment!.overallScore * 100).toStringAsFixed(0)}%',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityBadge() {
    final activity = activityResult!.activity.name.toUpperCase();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getActivityColor(activityResult!.activity).withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        activity,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildInsightsRow(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 4,
      children: [
        if (breedInfo != null && breedInfo!.size != null)
          _buildInsightChip(
            Icons.straighten,
            breedInfo!.size!,
            Colors.blue,
          ),
        if (breedInfo != null && breedInfo!.temperament != null)
          _buildInsightChip(
            Icons.mood,
            breedInfo!.temperament!.split(',').first.trim(),
            Colors.teal,
          ),
        if (healthAssessment != null)
          _buildInsightChip(
            Icons.favorite,
            healthAssessment!.status.name,
            _getHealthColor(healthAssessment!.status),
          ),
      ],
    );
  }

  Widget _buildInsightChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Color _getHealthColor(HealthStatus status) {
    switch (status) {
      case HealthStatus.good:
        return Colors.green;
      case HealthStatus.fair:
        return Colors.orange;
      case HealthStatus.concerning:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getHealthIcon(HealthStatus status) {
    switch (status) {
      case HealthStatus.good:
        return Icons.check_circle;
      case HealthStatus.fair:
        return Icons.warning;
      case HealthStatus.concerning:
        return Icons.error;
      default:
        return Icons.help;
    }
  }

  Color _getActivityColor(PetActivity activity) {
    switch (activity) {
      case PetActivity.running:
      case PetActivity.playing:
        return Colors.orange;
      case PetActivity.walking:
        return Colors.blue;
      case PetActivity.sitting:
      case PetActivity.standing:
        return Colors.green;
      case PetActivity.eating:
        return Colors.amber;
      case PetActivity.sleeping:
        return Colors.indigo;
      default:
        return Colors.grey;
    }
  }
}
