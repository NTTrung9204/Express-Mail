class ShopProfile {
  final int id;
  final int user;
  final String address;
  final String phoneNumber;
  final String latitude;
  final String longitude;
  final int postOffice;

  ShopProfile({
    required this.id,
    required this.user,
    required this.address,
    required this.phoneNumber,
    required this.latitude,
    required this.longitude,
    required this.postOffice,
  });

  factory ShopProfile.fromJson(Map<String, dynamic> json) {
    return ShopProfile(
      id: json['id'] ?? 0,
      user: json['user'] ?? 0,
      address: json['address'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      latitude: json['latitude'] ?? '',
      longitude: json['longitude'] ?? '',
      postOffice: json['postOffice'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': user,
      'address': address,
      'phoneNumber': phoneNumber,
      'latitude': latitude,
      'longitude': longitude,
      'postOffice': postOffice,
    };
  }
}
