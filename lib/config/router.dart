import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/user_role.dart';
import '../providers/auth_provider.dart';

// Auth screens
import '../screens/auth/public_login_screen.dart';
import '../screens/auth/public_signup_screen.dart';
import '../screens/auth/ngo_login_screen.dart';
import '../screens/auth/ngo_signup_screen.dart';

// Public screens
import '../screens/public/public_home_screen.dart';
import '../screens/public/ai_camera_screen.dart';
import '../screens/public/report_screen.dart';
import '../screens/public/adoption_list_screen.dart';
import '../screens/public/adoption_detail_screen.dart';
import '../screens/public/adoption_flow_screen.dart';
import '../screens/public/community_screen.dart';

// NGO screens
import '../screens/ngo/ngo_home_screen.dart';
import '../screens/ngo/mission_control_screen.dart';
import '../screens/ngo/disaster_map_screen.dart';
import '../screens/ngo/stray_identity_screen.dart';
import '../screens/ngo/scan_cert_screen.dart';
import '../screens/ngo/ngo_community_screen.dart';

// Wrapper for tabbed navigation
import '../screens/main_navigation.dart';

/// App router configuration using GoRouter
class AppRouter {
  final AuthProvider authProvider;

  AppRouter(this.authProvider);

  late final GoRouter router = GoRouter(
    refreshListenable: authProvider,
    redirect: _handleRedirect,
    routes: [
      // ==================== AUTH ROUTES ====================
      GoRoute(
        path: '/',
        redirect: (context, state) {
          if (authProvider.isAuthenticated) {
            if (authProvider.userRole == UserRole.ngo) {
              return '/ngo/home';
            } else {
              return '/public/home';
            }
          }
          return '/auth/public/login';
        },
      ),

      // Public Auth
      GoRoute(
        path: '/auth/public/login',
        name: 'publicLogin',
        builder: (context, state) => const PublicLoginScreen(),
      ),
      GoRoute(
        path: '/auth/public/signup',
        name: 'publicSignup',
        builder: (context, state) => const PublicSignUpScreen(),
      ),

      // NGO Auth
      GoRoute(
        path: '/auth/ngo/login',
        name: 'ngoLogin',
        builder: (context, state) => const NGOLoginScreen(),
      ),
      GoRoute(
        path: '/auth/ngo/signup',
        name: 'ngoSignup',
        builder: (context, state) => const NGOSignUpScreen(),
      ),

      // ==================== PUBLIC USER ROUTES ====================
      ShellRoute(
        builder: (context, state, child) {
          return MainNavigation(
            child: child,
            userRole: UserRole.public,
          );
        },
        routes: [
          GoRoute(
            path: '/public/home',
            name: 'publicHome',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const PublicHomeScreen(),
            ),
          ),
          GoRoute(
            path: '/public/camera',
            name: 'publicCamera',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const AICameraScreen(),
            ),
          ),
          GoRoute(
            path: '/public/adoption',
            name: 'adoption',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const AdoptionListScreen(),
            ),
          ),
          GoRoute(
            path: '/public/community',
            name: 'publicCommunity',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const CommunityScreen(),
            ),
          ),
        ],
      ),

      // Public routes without bottom nav
      GoRoute(
        path: '/public/report',
        name: 'report',
        builder: (context, state) => const ReportScreen(),
      ),
      GoRoute(
        path: '/public/adoption/:id',
        name: 'adoptionDetail',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return AdoptionDetailScreen(animalId: id);
        },
      ),
      GoRoute(
        path: '/public/adoption/apply/:id',
        name: 'adoptionFlow',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return AdoptionFlowScreen(animalId: id);
        },
      ),

      // ==================== NGO ROUTES ====================
      ShellRoute(
        builder: (context, state, child) {
          return MainNavigation(
            child: child,
            userRole: UserRole.ngo,
          );
        },
        routes: [
          GoRoute(
            path: '/ngo/home',
            name: 'ngoHome',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const NGOHomeScreen(),
            ),
          ),
          GoRoute(
            path: '/ngo/mission-control',
            name: 'missionControl',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const MissionControlScreen(),
            ),
          ),
          GoRoute(
            path: '/ngo/camera',
            name: 'ngoCamera',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const AICameraScreen(),
            ),
          ),
          GoRoute(
            path: '/ngo/community',
            name: 'ngoCommunity',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const NGOCommunityScreen(),
            ),
          ),
        ],
      ),

      // NGO routes without bottom nav
      GoRoute(
        path: '/ngo/disaster-map',
        name: 'disasterMap',
        builder: (context, state) => const DisasterMapScreen(),
      ),
      GoRoute(
        path: '/ngo/stray-identity',
        name: 'strayIdentity',
        builder: (context, state) => const StrayIdentityScreen(),
      ),
      GoRoute(
        path: '/ngo/scan-cert',
        name: 'scanCert',
        builder: (context, state) => const ScanCertScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );

  /// Handle route guards and redirects
  String? _handleRedirect(BuildContext context, GoRouterState state) {
    final isAuthenticated = authProvider.isAuthenticated;
    final userRole = authProvider.userRole;
    final isAuthRoute = state.uri.path.startsWith('/auth');

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isAuthRoute) {
      return '/auth/public/login';
    }

    // If authenticated and on auth page, redirect to home
    if (isAuthenticated && isAuthRoute) {
      if (userRole == UserRole.ngo) {
        return '/ngo/home';
      } else {
        return '/public/home';
      }
    }

    // Block public users from NGO routes
    if (userRole == UserRole.public && state.uri.path.startsWith('/ngo')) {
      return '/public/home';
    }

    // Block NGO users from public routes (except camera which is shared)
    if (userRole == UserRole.ngo && 
        state.uri.path.startsWith('/public') && 
        !state.uri.path.contains('camera')) {
      return '/ngo/home';
    }

    return null; // No redirect needed
  }
}
