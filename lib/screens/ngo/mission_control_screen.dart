import 'package:flutter/material.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/status_banner.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/activity_card.dart';

/// Mission Control Screen for NGO users - converts NGO_MissionControl.html
class MissionControlScreen extends StatelessWidget {
  const MissionControlScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Mission Control',
        leadingIcon: Icons.shield_outlined,
        notificationCount: 3,
      ),
      body: Column(
        children: [
          // Disaster Mode Banner
          StatusBanner.disaster(
            message: 'SYSTEM STATUS: DISASTER MODE ACTIVE',
          ),
          
          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Disaster Heatmap Section Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'DISASTER HEATMAP',
                        style: theme.textTheme.labelMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                          color: theme.colorScheme.onBackground.withOpacity(0.7),
                        ),
                      ),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Live Feed',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: theme.colorScheme.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // Map Placeholder
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: theme.colorScheme.outline.withOpacity(0.2),
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.map_outlined,
                            size: 48,
                            color: theme.colorScheme.onSurface.withOpacity(0.3),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Heat Map View',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurface.withOpacity(0.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Emergency Stats
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          label: 'At Risk',
                          value: '1,240',
                          trend: '+12%',
                          isTrendPositive: false,
                          progressValue: 0.75,
                          progressColor: const Color(0xFFB87A7A), // Muted red
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: StatCard(
                          label: 'Urgent',
                          value: '18',
                          trend: '-2%',
                          isTrendPositive: true,
                          progressValue: 0.4,
                          progressColor: const Color(0xFF7A9D96), // Muted teal
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Recent Activity Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Activity',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // Activity List
                  ActivityCard(
                    icon: Icons.emergency,
                    iconColor: const Color(0xFFB87A7A),
                    title: 'Dog spotted in Flood Zone B',
                    description: 'Reported via Citizen App • High Priority',
                    timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
                    isUrgent: true,
                  ),
                  ActivityCard(
                    icon: Icons.groups,
                    iconColor: theme.colorScheme.primary,
                    title: 'Rescue Team Alpha deployed',
                    description: 'Assigned to Sector 4 (Animal Shelter 12)',
                    timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
                  ),
                  ActivityCard(
                    icon: Icons.fingerprint,
                    iconColor: const Color(0xFFAAC7D8),
                    title: 'Identity Match: Buddy',
                    description: 'Golden Retriever match found in Database',
                    timestamp: DateTime.now().subtract(const Duration(minutes: 45)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
