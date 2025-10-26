class User {
  final int id;
  final String username;
  final String firstName;
  final String lastName;
  final String role;

  /// Getter trả về họ tên đầy đủ
  String get fullName => ("$firstName $lastName").trim();

  const User({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.role,
  });

  /// Parse JSON → User
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      firstName: json['firstName'],
      lastName: json['lastName'],
      role: json['role'],
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
    };
  }

  /// Copy object (immutable update)
  User copyWith({
    int? id,
    String? username,
    String? firstName,
    String? lastName,
    String? role,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      role: role ?? this.role,
    );
  }
}
