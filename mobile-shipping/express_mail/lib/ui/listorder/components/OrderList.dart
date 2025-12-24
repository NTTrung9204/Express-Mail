import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/ui/listorder/components/OrderItem.dart';

class OrderList extends StatelessWidget {
  final LoginResponse loginResponse;
  final List<ShippingOrder> orders;
  final bool isDelivery;
  final Function(ShippingOrder order, String status)? onOrderFinished;

  const OrderList({
    super.key,
    required this.loginResponse,
    required this.orders,
    required this.isDelivery,
    this.onOrderFinished,
  });

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) return _buildEmpty();
    return _buildList(orders);
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 30),
            child: Padding(
              padding: EdgeInsetsGeometry.all(30),
              child: AspectRatio(
                aspectRatio: 1,
                child: Image.asset(
                  "assets/images/img_no_data.webp",
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ),
          const Text(
            AppStrings.no_order_data,
            style: TextStyle(color: Colors.black54, fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildList(List<ShippingOrder> orders) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 0.0),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        final order = orders[index];
        return OrderItem(
          isShimmer: false,
          loginResponse: loginResponse,
          detailOrder: order,
          isDelivery: isDelivery,
          onFinish: (status) => onOrderFinished?.call(order, status),
        );
      },
    );
  }
}
