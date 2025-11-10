import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/data/model/Order.dart';
import 'package:express_mail/data/model/Product.dart';
import 'package:express_mail/data/model/ShopOwner.dart';

class DetailOrder {
  final int id;
  final ShippingStatus status;
  final Order order;
  final ShopOwner shopOwner;
  final List<Product> products;

  DetailOrder({
    required this.id,
    required this.status,
    required this.order,
    required this.shopOwner,
    required this.products,
  });

  factory DetailOrder.fromJson(Map<String, dynamic> json) {
    final orderData = json['order'] ?? {};

    List<Product> products = (orderData['products'] as List<dynamic>? ?? [])
        .map((e) => Product.fromJson(e))
        .toList();

    ShopOwner shopOwner = ShopOwner.fromJson(orderData['shopProfile'] ?? {});

    return DetailOrder(
      id: json['id'] ?? 0,
      status: DetailOrder.parseShippingStatus(json['status']),
      order: Order.fromJson(orderData),
      shopOwner: shopOwner,
      products: products,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'status': status.name,
      'order': order.toJson(),
      'shopProfile': shopOwner.toJson(),
      'products': products.map((e) => e.toJson()).toList(),
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
      case "FINISHED":
        return ShippingStatus.FINISHED;
      default:
        return ShippingStatus.PICKUP_REQUESTED;
    }
  }
}
