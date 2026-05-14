import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/user_role.dart';

/// Main navigation wrapper with bottom navigation bar
class MainNavigation extends StatefulWidget {
  final Widget child;
  final UserRole userRole;

  const MainNavigation({
    super.key,
    required this.child,
    required this.userRole,
  });

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  // Navigation items for public users
  final List<NavigationItem> _publicNavItems = const [
    NavigationItem(
      icon: Icons.home_outlined,
      selectedIcon: Icons.home,
      label: 'HOME',
      route: '/public/home',
    ),
    NavigationItem(
      icon: Icons.pets_outlined,
      selectedIcon: Icons.pets,
      label: 'ADOPT',
      route: '/public/adoption',
    ),
    NavigationItem(
      icon: Icons.camera_alt,
      selectedIcon: Icons.camera_alt,
      label: '',
      route: '/public/camera',
      isCenter: true,
    ),
    NavigationItem(
      icon: Icons.groups_outlined,
      selectedIcon: Icons.groups,
      label: 'COMMUNITY',
      route: '/public/community',
    ),
    NavigationItem(
      icon: Icons.person_outline,
      selectedIcon: Icons.person,
      label: 'PROFILE',
      route: '/public/profile',
    ),
  ];

  // Navigation items for NGO users
  final List<NavigationItem> _ngoNavItems = const [
    NavigationItem(
      icon: Icons.dashboard_outlined,
      selectedIcon: Icons.dashboard,
      label: 'HOME',
      route: '/ngo/home',
    ),
    NavigationItem(
      icon: Icons.map_outlined,
      selectedIcon: Icons.map,
      label: 'MAP',
      route: '/ngo/mission-control',
    ),
    NavigationItem(
      icon: Icons.camera_alt,
      selectedIcon: Icons.camera_alt,
      label: '',
      route: '/ngo/camera',
      isCenter: true,
    ),
    NavigationItem(
      icon: Icons.groups_outlined,
      selectedIcon: Icons.groups,
      label: 'COMMUNITY',
      route: '/ngo/community',
    ),
    NavigationItem(
      icon: Icons.volunteer_activism_outlined,
      selectedIcon: Icons.volunteer_activism,
      label: 'ADOPTION',
      route: '/public/adoption',
    ),
  ];

  List<NavigationItem> get _navItems =>
      widget.userRole == UserRole.ngo ? _ngoNavItems : _publicNavItems;

  void _onItemTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
    context.go(_navItems[index].route);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      body: widget.child,
      extendBody: true,
      floatingActionButton: _buildCenterFAB(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: theme.colorScheme.outline.withOpacity(0.2),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: ClipRRect(
          child: BackdropFilter(
            filter: const ColorFilter.mode(
              Colors.transparent,
              BlendMode.src,
            ),
            child: BottomAppBar(
              color: theme.colorScheme.surface.withOpacity(0.9),
              elevation: 0,
              notchMargin: 8,
              shape: const CircularNotchedRectangle(),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: List.generate(_navItems.length, (index) {
                    final item = _navItems[index];
                    
                    // Skip center FAB in the row
                    if (item.isCenter) {
                      return const SizedBox(width: 56);
                    }

                    final isSelected = _currentIndex == index;

                    return InkWell(
                      onTap: () => _onItemTapped(index),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isSelected ? item.selectedIcon : item.icon,
                              color: isSelected
                                  ? theme.colorScheme.primary
                                  : theme.colorScheme.onSurface.withOpacity(0.6),
                              size: 24,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item.label,
                              style: theme.textTheme.labelSmall?.copyWith(
                                fontSize: 10,
                                fontWeight:
                                    isSelected ? FontWeight.bold : FontWeight.w500,
                                color: isSelected
                                    ? theme.colorScheme.primary
                                    : theme.colorScheme.onSurface.withOpacity(0.6),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCenterFAB(BuildContext context) {
    final theme = Theme.of(context);
    final centerItem = _navItems.firstWhere((item) => item.isCenter);
    final centerIndex = _navItems.indexOf(centerItem);

    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.primary.withOpacity(0.3),
            blurRadius: 15,
            spreadRadius: 2,
          ),
        ],
      ),
      child: FloatingActionButton(
        onPressed: () => _onItemTapped(centerIndex),
        elevation: 6,
        child: Icon(
          centerItem.icon,
          size: 32,
        ),
      ),
    );
  }
}

/// Navigation item model
class NavigationItem {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final String route;
  final bool isCenter;

  const NavigationItem({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.route,
    this.isCenter = false,
  });
}
