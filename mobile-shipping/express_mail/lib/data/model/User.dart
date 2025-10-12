class User {
  final int id;
  final String username;
  final String email;
  final String password;
  final bool isActive;
  final String? cardId;
  final String? phone;
  final String? provinceCity;
  final String? wardCommune;
  final String? address;
  final String? coordinate;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.password,
    required this.isActive,
    this.cardId,
    this.phone,
    this.provinceCity,
    this.wardCommune,
    this.address,
    this.coordinate,
  });

  /// Chuyển từ JSON → User
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      password: json['password'] ?? '',
      isActive: json['is_active'] ?? false,
      cardId: json['card_id'],
      phone: json['phone'],
      provinceCity: json['province_city'],
      wardCommune: json['ward_commune'],
      address: json['address'],
      coordinate: json['coordinate'],
    );
  }

  /// Chuyển từ User → JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'password': password,
      'is_active': isActive,
      'card_id': cardId,
      'phone': phone,
      'province_city': provinceCity,
      'ward_commune': wardCommune,
      'address': address,
      'coordinate': coordinate,
    };
  }

  /// Copy object với thay đổi (immutable update)
  User copyWith({
    int? id,
    String? username,
    String? email,
    String? password,
    bool? isActive,
    String? cardId,
    String? phone,
    String? provinceCity,
    String? wardCommune,
    String? address,
    String? coordinate,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      password: password ?? this.password,
      isActive: isActive ?? this.isActive,
      cardId: cardId ?? this.cardId,
      phone: phone ?? this.phone,
      provinceCity: provinceCity ?? this.provinceCity,
      wardCommune: wardCommune ?? this.wardCommune,
      address: address ?? this.address,
      coordinate: coordinate ?? this.coordinate,
    );
  }
}
