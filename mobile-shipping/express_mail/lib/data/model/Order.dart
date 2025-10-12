import 'package:express_mail/data/enum/OrderStatus.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';

class Order {
  final int id;
  final String code;
  int shopId;
  String receiverPhone;
  String receiverProvinceCity;
  String receiverWardCommune;
  String receiverAddress;
  String receiverCoordinate;
  double length;
  double width;
  double height;
  double weight;
  double cod;
  double shippingCost;
  double shippingCostPayPer;
  ShippingStatus shippingStatus;
  OrderStatus orderStatus;

  Order({
    required this.id,
    required this.code,
    required this.shopId,
    required this.receiverPhone,
    required this.receiverProvinceCity,
    required this.receiverWardCommune,
    required this.receiverAddress,
    required this.receiverCoordinate,
    required this.length,
    required this.width,
    required this.height,
    required this.weight,
    required this.cod,
    required this.shippingCost,
    required this.shippingCostPayPer,
    required this.shippingStatus,
    required this.orderStatus,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      code: json['code'],
      shopId: json['shop_id'],
      receiverPhone: json['receiver_phone'],
      receiverProvinceCity: json['recever_province_city'],
      receiverWardCommune: json['recever_ward_commune'],
      receiverAddress: json['recever_address'],
      receiverCoordinate: json['recever_coordinate'],
      length: (json['length'] ?? 0).toDouble(),
      width: (json['width'] ?? 0).toDouble(),
      height: (json['height'] ?? 0).toDouble(),
      weight: (json['weight'] ?? 0).toDouble(),
      cod: (json['cod'] ?? 0).toDouble(),
      shippingCost: (json['shipping_cost'] ?? 0).toDouble(),
      shippingCostPayPer: (json['shipping_cost_payper'] ?? 0).toDouble(),
      shippingStatus: ShippingStatus.values.firstWhere(
              (e) => e.toString().split('.').last == json['shipping_status'],
          orElse: () => ShippingStatus.PICKUP_REQUESTED),
      orderStatus: OrderStatus.values.firstWhere(
              (e) => e.toString().split('.').last == json['order_status'],
          orElse: () => OrderStatus.PENDING),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'shop_id': shopId,
      'receiver_phone': receiverPhone,
      'recever_province_city': receiverProvinceCity,
      'recever_ward_commune': receiverWardCommune,
      'recever_address': receiverAddress,
      'recever_coordinate': receiverCoordinate,
      'length': length,
      'width': width,
      'height': height,
      'weight': weight,
      'cod': cod,
      'shipping_cost': shippingCost,
      'shipping_cost_payper': shippingCostPayPer,
      'shipping_status': shippingStatus.toString().split('.').last,
      'order_status': orderStatus.toString().split('.').last,
    };
  }
}
