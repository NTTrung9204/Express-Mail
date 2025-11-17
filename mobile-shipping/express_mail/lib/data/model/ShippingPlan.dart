import 'package:express_mail/data/model/ShippingOrder.dart';

class ShippingPlan {
  final List<ShippingOrder> orders;
  final String geometry;
  final String mode;
  final String time;
  final int distance;
  final int duration;

  ShippingPlan({
    required this.orders,
    required this.geometry,
    required this.mode,
    required this.time,
    required this.distance,
    required this.duration,
  });

  factory ShippingPlan.fromJson(Map<String, dynamic> json) {
    return ShippingPlan(
      orders: (json['orders'] as List<dynamic>)
          .map((e) => ShippingOrder.fromJson(e))
          .toList(),
      geometry: json['geometry'] ?? '',
      mode: json['mode'] ?? '',
      time: json['time'] ?? '',
      distance: json['distance'] ?? 0,
      duration: json['duration'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'orders': orders.map((e) => e.toJson()).toList(),
      'geometry': geometry,
      'mode': mode,
      'time': time,
      'distance': distance,
      'duration': duration,
    };
  }
}
