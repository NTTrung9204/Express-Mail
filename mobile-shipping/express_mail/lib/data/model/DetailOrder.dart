import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/data/model/Order.dart';
import 'package:intl/intl.dart';

class DetailOrder {
  final int id;
  final ShippingStatus status;
  final Order order;
  final String createdAt;

  DetailOrder({
    required this.id,
    required this.status,
    required this.order,
    required this.createdAt,
  });

  factory DetailOrder.fromJson(Map<String, dynamic> json) {
    final orderData = json['order'] ?? {};
    String dtStr = '';
    if (json['createdAt'] != null) {
      DateTime? dt = DateTime.tryParse(json['createdAt'])?.toLocal();
      if (dt != null) {
        dtStr = DateFormat('HH:mm dd/MM/yyyy').format(dt);
      }
    }

    return DetailOrder(
      id: json['id'] ?? 0,
      status: DetailOrder.parseShippingStatus(json['status']),
      order: Order.fromJson(orderData),
      createdAt: dtStr,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'status': status.name,
      'order': order.toJson(),
      'createdAt': createdAt,
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
