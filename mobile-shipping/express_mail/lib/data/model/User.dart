class User {
  final int id;
  final String username;
  final String firstName;
  final String lastName;
  final String role;
  final String email;

  /// Getter
  String get fullName => ("$firstName $lastName").trim();

  const User({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.email,
  });

  /// Parse JSON → User
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      firstName: json['firstName'],
      lastName: json['lastName'],
      role: json['role'],
      email: json['email'],
    );
  }

  /// User → JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'role': role,
      'email': email,
    };
  }

  /// Copy object (immutable update)
  User copyWith({
    int? id,
    String? username,
    String? firstName,
    String? lastName,
    String? role,
    String? email,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      role: role ?? this.role,
      email: email ?? this.email,
    );
  }
}
