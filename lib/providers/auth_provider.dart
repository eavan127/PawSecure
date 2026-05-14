import 'package:flutter/foundation.dart';
import '../models/user_role.dart';

/// Authentication state provider
class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;
  UserRole get userRole => _currentUser?.role ?? UserRole.guest;

  /// Sign in with email and password
  Future<bool> signIn(String email, String password, UserRole role) async {
    _isLoading = true;
    notifyListeners();

    try {
      // TODO: Implement Firebase authentication
      await Future.delayed(const Duration(seconds: 1));

      // Mock user for testing
      _currentUser = User(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        name: 'Test User',
        email: email,
        role: role,
      );

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Sign up new user
  Future<bool> signUp({
    required String name,
    required String email,
    required String password,
    required UserRole role,
    String? organizationId,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      // TODO: Implement Firebase authentication
      await Future.delayed(const Duration(seconds: 1));

      _currentUser = User(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        name: name,
        email: email,
        role: role,
        organizationId: organizationId,
      );

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Sign out current user
  Future<void> signOut() async {
    _currentUser = null;
    notifyListeners();
  }

  /// Update user profile
  void updateUser(User user) {
    _currentUser = user;
    notifyListeners();
  }
}
