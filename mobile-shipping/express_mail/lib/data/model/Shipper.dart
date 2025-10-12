import 'package:express_mail/data/model/User.dart';

class Shipper extends User {
  final String fullName;
  final DateTime? birthDate;
  final String? vehicleType;
  final String? vehiclePlate;
  final String? vehicleColor;
  final int? vehicleYear;
  final String? avatar; // Thêm trường avatar

  Shipper({
    required int id,
    required String username,
    required String email,
    required String password,
    required bool isActive,
    String? cardId,
    String? phone,
    String? provinceCity,
    String? wardCommune,
    String? address,
    String? coordinate,
    required this.fullName,
    this.birthDate,
    this.vehicleType,
    this.vehiclePlate,
    this.vehicleColor,
    this.vehicleYear,
    this.avatar,
  }) : super(
    id: id,
    username: username,
    email: email,
    password: password,
    isActive: isActive,
    cardId: cardId,
    phone: phone,
    provinceCity: provinceCity,
    wardCommune: wardCommune,
    address: address,
    coordinate: coordinate,
  );

  /// Chuyển từ JSON → Shipper
  factory Shipper.fromJson(Map<String, dynamic> json) {
    return Shipper(
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
      fullName: json['full_name'] ?? '',
      birthDate: json['birth_date'] != null ? DateTime.parse(json['birth_date']) : null,
      vehicleType: json['vehicle_type'],
      vehiclePlate: json['vehicle_plate'],
      vehicleColor: json['vehicle_color'],
      vehicleYear: json['vehicle_year'],
      avatar: json['avatar'],
    );
  }

  /// Chuyển từ Shipper → JSON
  Map<String, dynamic> toJson() {
    final data = super.toJson();
    data.addAll({
      'full_name': fullName,
      'birth_date': birthDate?.toIso8601String(),
      'vehicle_type': vehicleType,
      'vehicle_plate': vehiclePlate,
      'vehicle_color': vehicleColor,
      'vehicle_year': vehicleYear,
      'avatar': avatar,
    });
    return data;
  }

  /// Copy object với thay đổi
  Shipper copyWith({
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
    String? fullName,
    DateTime? birthDate,
    String? vehicleType,
    String? vehiclePlate,
    String? vehicleColor,
    int? vehicleYear,
    String? avatar,
  }) {
    return Shipper(
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
      fullName: fullName ?? this.fullName,
      birthDate: birthDate ?? this.birthDate,
      vehicleType: vehicleType ?? this.vehicleType,
      vehiclePlate: vehiclePlate ?? this.vehiclePlate,
      vehicleColor: vehicleColor ?? this.vehicleColor,
      vehicleYear: vehicleYear ?? this.vehicleYear,
      avatar: avatar ?? this.avatar,
    );
  }
}
