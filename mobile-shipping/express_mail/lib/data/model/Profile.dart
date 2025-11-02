class Profile {
  final int id;
  final int postOffice;
  final String? phoneNumber;
  final String? address;
  final String? motorModel;
  final String? licensePlateNumber;
  final String? avatar;
  final String? cardId;

  Profile({
    required this.id,
    required this.postOffice,
    this.phoneNumber,
    this.address,
    this.motorModel,
    this.licensePlateNumber,
    this.avatar,
    this.cardId,
  });

  /// JSON → Profile
  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] ?? 0,
      postOffice: json['postOffice'] ?? 0,
      phoneNumber: json['phoneNumber'],
      address: json['address'],
      motorModel: json['motorModel'],
      licensePlateNumber: json['licensePlateNumber'],
      avatar: json['avatar'],
      cardId: json['cardId'],
    );
  }

  /// Profile → JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'postOffice': postOffice,
      'phoneNumber': phoneNumber,
      'address': address,
      'motorModel': motorModel,
      'licensePlateNumber': licensePlateNumber,
      'avatar': avatar,
      'cardId': cardId,
    };
  }

  /// Copy object
  Profile copyWith({
    int? id,
    int? user,
    int? postOffice,
    String? phoneNumber,
    String? address,
    String? motorModel,
    String? licensePlateNumber,
    String? avatar,
    String? cardId,
  }) {
    return Profile(
      id: id ?? this.id,
      postOffice: postOffice ?? this.postOffice,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      address: address ?? this.address,
      motorModel: motorModel ?? this.motorModel,
      licensePlateNumber: licensePlateNumber ?? this.licensePlateNumber,
      avatar: avatar ?? this.avatar,
      cardId: cardId ?? this.cardId,
    );
  }
}
