import 'package:flutter/material.dart';
import 'package:express_mail/data/model/DetailOrder.dart';

class DetailOrderViewModel {
  final DetailOrder detailOrder;

  final ValueNotifier<double> distance;
  final ValueNotifier<double> estimated;
  final ValueNotifier<bool> loading;

  DetailOrderViewModel({
    required this.detailOrder,
    required this.distance,
    required this.estimated,
    required this.loading,
  }) {
    _loadMockData();
  }

  void _loadMockData() {
    // Giả lập dữ liệu sau 2 giây
    Future.delayed(const Duration(seconds: 2), () {
      distance.value = 10;
      estimated.value = 20;
      loading.value = false;
    });
  }

  void dispose() {
    distance.dispose();
    estimated.dispose();
    loading.dispose();
  }
}
