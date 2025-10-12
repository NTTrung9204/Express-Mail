import 'package:express_mail/data/model/Order.dart';
import 'package:express_mail/data/model/Product.dart';
import 'package:express_mail/data/model/ShopOwner.dart';

class DetailOrder {
  final Order order;
  final ShopOwner shopOwner;
  final List<Product> products;

  DetailOrder({
    required this.order,
    required this.shopOwner,
    required this.products,
  });

  /// Tạo đối tượng DetailOrder từ JSON
  factory DetailOrder.fromJson(Map<String, dynamic> json) {
    return DetailOrder(
      order: Order.fromJson(json['order']),
      shopOwner: ShopOwner.fromJson(json['shop_owner']),
      products: (json['products'] as List<dynamic>?)
          ?.map((e) => Product.fromJson(e))
          .toList() ??
          [],
    );
  }

  /// Chuyển đối tượng DetailOrder sang JSON
  Map<String, dynamic> toJson() {
    return {
      'order': order.toJson(),
      'shop_owner': shopOwner.toJson(),
      'products': products.map((p) => p.toJson()).toList(),
    };
  }

  /// Tạo bản sao với dữ liệu cập nhật
  DetailOrder copyWith({
    Order? order,
    ShopOwner? shopOwner,
    List<Product>? products,
  }) {
    return DetailOrder(
      order: order ?? this.order,
      shopOwner: shopOwner ?? this.shopOwner,
      products: products ?? this.products,
    );
  }
}
