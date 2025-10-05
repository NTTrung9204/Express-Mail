import 'package:flutter/material.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/data/model/Order.dart';
import 'package:express_mail/data/model/ShopOwner.dart';
import 'package:express_mail/data/model/Product.dart';
import 'package:express_mail/data/enum/OrderStatus.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';

class OrderViewModel {
  final ValueNotifier<int> availableCount = ValueNotifier(0);
  final ValueNotifier<int> deliveringCount = ValueNotifier(0);
  final ValueNotifier<int> finishCount = ValueNotifier(0);
  final ValueNotifier<bool> loading = ValueNotifier(true);

  final ValueNotifier<List<DetailOrder>> availableOrders = ValueNotifier([]);
  final ValueNotifier<List<DetailOrder>> deliveringOrders = ValueNotifier([]);
  final ValueNotifier<List<DetailOrder>> finishedOrders = ValueNotifier([]);

  OrderViewModel() {
    _loadMockData();
  }

  void _loadMockData() {
    Future.delayed(const Duration(seconds: 1), () {
      // Danh sách shop owners
      final shopOwners = [
        ShopOwner(
          id: 1,
          username: 'shopA',
          email: 'shopA@gmail.com',
          password: '123456',
          isActive: true,
          phone: '0905123456',
          provinceCity: 'Đà Nẵng',
          wardCommune: 'Hòa Khánh',
          address: '123 Nguyễn Văn Linh',
          coordinate: '16.047079,108.206230',
        ),
        ShopOwner(
          id: 2,
          username: 'shopB',
          email: 'shopB@gmail.com',
          password: '123456',
          isActive: true,
          phone: '0912345678',
          provinceCity: 'Hồ Chí Minh',
          wardCommune: 'Quận 1',
          address: '456 Lê Lợi',
          coordinate: '10.776889,106.700806',
        ),
      ];

      // Danh sách orders
      final orders = [
        Order(
          id: 101,
          code: 'OD001',
          shopId: 1,
          receiverPhone: '0987654321',
          receiverProvinceCity: 'Hà Nội',
          receiverWardCommune: 'Cầu Giấy',
          receiverAddress: '12 Trần Thái Tông',
          receiverCoordinate: '21.028511,105.804817',
          length: 10,
          width: 15,
          height: 20,
          weight: 2,
          cod: 50000,
          shippingCost: 15000,
          shippingCostPayPer: 15000,
          shippingStatus: ShippingStatus.SHIPPING,
          orderStatus: OrderStatus.PENDING,
        ),
        Order(
          id: 102,
          code: 'OD002',
          shopId: 2,
          receiverPhone: '0978889999',
          receiverProvinceCity: 'Huế',
          receiverWardCommune: 'Phú Nhuận',
          receiverAddress: '99 Hùng Vương',
          receiverCoordinate: '16.463713,107.590866',
          length: 12,
          width: 18,
          height: 25,
          weight: 3.5,
          cod: 120000,
          shippingCost: 20000,
          shippingCostPayPer: 20000,
          shippingStatus: ShippingStatus.PICKUP_REQUESTED,
          orderStatus: OrderStatus.PENDING,
        ),
      ];

      // Danh sách products
      final products = [
        Product(
          id: 1,
          orderId: 101,
          name: 'Sản phẩm A1',
          quantity: 2,
          weight: 1.0,
          imgUrl: "https://bigpicturesb.org/wp-content/uploads/2024/10/anh-nen-phong-canh-thien-nhien-48.jpeg",
        ),
        Product(
          id: 2,
          orderId: 102,
          name: 'Sản phẩm A2',
          quantity: 1,
          weight: 0.5,
          imgUrl: "https://bigpicturesb.org/wp-content/uploads/2024/10/anh-nen-phong-canh-thien-nhien-48.jpeg",
        ),
        Product(
          id: 3,
          orderId: 102,
          name: 'Sản phẩm B1',
          quantity: 3,
          weight: 2.0,
          imgUrl: "https://bigpicturesb.org/wp-content/uploads/2024/10/anh-nen-phong-canh-thien-nhien-47-2048x1280.jpeg",
        ),
      ];

      // Tạo DetailOrder
      final detailOrders = orders.map((order) {
        final shopOwner = shopOwners.firstWhere((s) => s.id == order.shopId);
        final orderProducts =
        products.where((p) => p.orderId == order.id).toList();

        return DetailOrder(
          order: order,
          shopOwner: shopOwner,
          products: orderProducts,
        );
      }).toList();

      // Phân loại trạng thái
      availableOrders.value = detailOrders
          .where(
              (d) => d.order.shippingStatus == ShippingStatus.PICKUP_REQUESTED)
          .toList();
      deliveringOrders.value = detailOrders
          .where((d) => d.order.shippingStatus == ShippingStatus.SHIPPING)
          .toList();
      finishedOrders.value = detailOrders
          .where((d) => d.order.orderStatus == OrderStatus.COMPLETED)
          .toList();

      availableCount.value = availableOrders.value.length;
      deliveringCount.value = deliveringOrders.value.length;
      finishCount.value = finishedOrders.value.length;
      loading.value = false;
    });
  }

  void dispose() {
    availableCount.dispose();
    deliveringCount.dispose();
    finishCount.dispose();
    availableOrders.dispose();
    deliveringOrders.dispose();
    finishedOrders.dispose();
  }
}
