import 'package:intl/intl.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';

class Shipping {
  final int id;
  final String shipperId;
  final ShippingStatus status;

  Shipping({
    required this.id,
    required this.shipperId,
    required this.status,
  });

  factory Shipping.fromJson(Map<String, dynamic> json) {
    return Shipping(
      id: json['id'] ?? 0,
      shipperId: json['shipperId'],
      status: parseShippingStatus(json['status']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'shipperId': shipperId,
      'status': status.name,
    };
  }

  static ShippingStatus parseShippingStatus(String? status) {
    switch (status) {
      case 'PICKUP_REQUESTED':
        return ShippingStatus.PICKUP_REQUESTED;
      case 'SHIPPING':
        return ShippingStatus.SHIPPING;
      case 'RETURNING':
        return ShippingStatus.RETURNING;
      case 'FINISHED':
        return ShippingStatus.FINISHED;
      default:
        return ShippingStatus.PICKUP_REQUESTED;
    }
  }
}
