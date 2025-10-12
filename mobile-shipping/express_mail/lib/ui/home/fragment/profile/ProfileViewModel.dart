import 'package:express_mail/data/model/Shipper.dart';
import 'package:flutter/material.dart';

class ShipperViewModel {
  final ValueNotifier<Shipper?> shipper;
  final ValueNotifier<bool> loading;

  ShipperViewModel()
      : shipper = ValueNotifier<Shipper?>(null),
        loading = ValueNotifier<bool>(true) {
    _loadMockData();
  }

  void _loadMockData() {
    // Giả lập dữ liệu sau 2 giây
    Future.delayed(const Duration(seconds: 2), () {
      shipper.value = Shipper(
        id: 1,
        username: 'shipper01',
        email: 'shipper01@mail.com',
        password: '123456',
        isActive: true,
        cardId: '123456789',
        phone: '0987654321',
        fullName: 'Nguyen Van A',
        birthDate: DateTime(1990, 5, 12),
        vehicleType: 'Honda Civic',
        vehiclePlate: '43A-12345',
        vehicleColor: 'Đỏ',
        vehicleYear: 2018,
        provinceCity: 'Đà Nẵng',
        wardCommune: 'Hòa Thuận Đông',
        address: '123 Nguyễn Văn Linh',
        coordinate: '16.047079,108.206230',
        avatar:
        'https://thichtrangtri.com/wp-content/uploads/2025/05/anh-meo-gian-cute-3.jpg',
      );
      loading.value = false;
    });
  }

  void dispose() {
    shipper.dispose();
    loading.dispose();
  }
}
