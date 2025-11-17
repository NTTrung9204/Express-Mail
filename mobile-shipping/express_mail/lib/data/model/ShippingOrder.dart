import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/data/model/RouteStep.dart';

import 'Product.dart';
import 'ShopProfile.dart';

class ShippingOrder {
  final int id;
  final String code;
  final String shopId;
  final String shippingFeeId;
  final String receiverPhone;
  final String receiverProvinceCity;
  final String receiverWardCommune;
  final String receiverAddress;
  final String receiverCoordinate;

  final int length;
  final int width;
  final int height;
  final double weight;

  final double cod;
  final double shippingCost;
  final double shippingCostPayPer;
  final bool isReceiverPayShipping;

  final ShippingStatus shippingStatus;
  final String orderStatus;

  final String createdAt;
  final String updatedAt;
  final String deletedAt;

  final List<Product>? products;

  final RouteStep routeStep;
  final ShopProfile shopProfile;

  ShippingOrder({
    required this.id,
    required this.code,
    required this.shopId,
    required this.shippingFeeId,
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
    required this.isReceiverPayShipping,
    required this.shippingStatus,
    required this.orderStatus,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.products,
    required this.routeStep,
    required this.shopProfile,
  });

  factory ShippingOrder.fromJson(Map<String, dynamic> json) {
    return ShippingOrder(
      id: json['id'] ?? 0,
      code: json['code'] ?? '',
      shopId: json['shopId'] ?? '',
      shippingFeeId: json['shippingFeeId'] ?? '',
      receiverPhone: json['receiver_phone'] ?? '',
      receiverProvinceCity: json['receiver_province_city'] ?? '',
      receiverWardCommune: json['receiver_ward_commune'] ?? '',
      receiverAddress: json['receiver_address'] ?? '',
      receiverCoordinate: json['receiver_coordinate'] ?? '',

      length: json['length'] ?? 0,
      width: json['width'] ?? 0,
      height: json['height'] ?? 0,
      weight: (json['weight'] ?? 0).toDouble(),

      cod: (json['cod'] ?? 0).toDouble(),
      shippingCost: (json['shipping_cost'] ?? 0).toDouble(),
      shippingCostPayPer: (json['shipping_cost_payper'] ?? 0).toDouble(),
      isReceiverPayShipping: json['is_receiver_pay_shipping'] ?? false,

      shippingStatus: parseShippingStatus(json['shipping_status']),

      orderStatus: json['order_status'] ?? '',

      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      deletedAt: json['deleted_at'] ?? '',

      products:
          (json['products'] as List<dynamic>?)
              ?.map((e) => Product.fromJson(e))
              .toList() ??
          [],
      routeStep: RouteStep.fromJson(json['routeStep'] ?? {}),
      shopProfile: ShopProfile.fromJson(json['shopProfile'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'shopId': shopId,
      'shippingFeeId': shippingFeeId,
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
      'is_receiver_pay_shipping': isReceiverPayShipping,

      'shipping_status': shippingStatus,
      'order_status': orderStatus,

      'created_at': createdAt,
      'updated_at': updatedAt,
      'deleted_at': deletedAt,

      'products': products?.map((e) => e.toJson()).toList() ?? [],
      'routeStep': routeStep.toJson(),
      'shopProfile': shopProfile.toJson(),
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
