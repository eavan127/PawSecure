/// User role enumeration for role-based routing and access control
enum UserRole {
  /// Public user - can report strays, adopt, view community
  public,
  
  /// NGO user - has access to mission control, disaster management, identity verification
  ngo,
  
  /// Guest/unauthenticated user
  guest;

  /// Get display name for the role
  String get displayName {
    switch (this) {
      case UserRole.public:
        return 'Public User';
      case UserRole.ngo:
        return 'NGO';
      case UserRole.guest:
        return 'Guest';
    }
  }

  /// Check if user has access to NGO features
  bool get isNGO => this == UserRole.ngo;

  /// Check if user is authenticated
  bool get isAuthenticated => this != UserRole.guest;
}

/// User model representing authenticated user
class User {
  final String id;
  final String name;
  final String email;
  final UserRole role;
  final String? organizationId; // For NGO users
  final String? photoUrl;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.organizationId,
    this.photoUrl,
  });

  /// Factory constructor for creating user from Firestore document
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      role: UserRole.values.firstWhere(
        (r) => r.name == json['role'],
        orElse: () => UserRole.guest,
      ),
      organizationId: json['organizationId'] as String?,
      photoUrl: json['photoUrl'] as String?,
    );
  }

  /// Convert user to JSON for Firestore
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role.name,
      if (organizationId != null) 'organizationId': organizationId,
      if (photoUrl != null) 'photoUrl': photoUrl,
    };
  }

  /// Create a copy with modified fields
  User copyWith({
    String? id,
    String? name,
    String? email,
    UserRole? role,
    String? organizationId,
    String? photoUrl,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      organizationId: organizationId ?? this.organizationId,
      photoUrl: photoUrl ?? this.photoUrl,
    );
  }
}
