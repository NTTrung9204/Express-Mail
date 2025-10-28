import 'package:express_mail/data/enum/OrderStatus.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';

class Order {
  final int id;
  final String code;
  final int shopId;
  final String receiverPhone;
  final String receiverProvinceCity;
  final String receiverWardCommune;
  final String receiverAddress;
  final String receiverCoordinate;
  final double length;
  final double width;
  final double height;
  final double weight;
  final double cod;
  final double shippingCost;
  final double shippingCostPayPer;
  final ShippingStatus shippingStatus;
  final OrderStatus orderStatus;

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
      id: json['id'] ?? 0,
      code: json['code'] ?? '',
      shopId: int.tryParse(json['shopId']?.toString() ?? '0') ?? 0,
      receiverPhone: json['receiver_phone'] ?? '',
      receiverProvinceCity: json['receiver_province_city'] ?? '',
      receiverWardCommune: json['receiver_ward_commune'] ?? '',
      receiverAddress: json['receiver_address'] ?? '',
      receiverCoordinate: json['receiver_coordinate'] ?? '',
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
      'shopId': shopId,
      'receiver_phone': receiverPhone,
      'receiver_province_city': receiverProvinceCity,
      'receiver_ward_commune': receiverWardCommune,
      'receiver_address': receiverAddress,
      'receiver_coordinate': receiverCoordinate,
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