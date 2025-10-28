class ShopOwner {
  final int id;
  final String address;
  final String phoneNumber;

  ShopOwner({
    required this.id,
    required this.address,
    required this.phoneNumber,
  });

  factory ShopOwner.fromJson(Map<String, dynamic> json) {
    return ShopOwner(
      id: json['id'] ?? 0,
      address: json['address'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'address': address, 'phoneNumber': phoneNumber};
  }

  factory ShopOwner.empty() => ShopOwner(id: 0, address: '', phoneNumber: '');
}
