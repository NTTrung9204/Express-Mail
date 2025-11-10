import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/ui/home/fragment/order/components/OrderItem.dart';

class OrderList extends StatelessWidget {
  final LoginResponse loginResponse;
  final List<DetailOrder> orders;
  final bool isLoading;
  final Function(int orderId)? onOrderFinished;

  const OrderList({
    super.key,
    required this.loginResponse,
    required this.orders,
    required this.isLoading,
    this.onOrderFinished,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) return _buildShimmerLoading();
    if (orders.isEmpty) return _buildEmpty();
    return _buildList(orders);
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 0.0),
      itemCount: 5,
      itemBuilder: (context, index) {
        return const OrderItem(isShimmer: true);
      },
    );
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

  Widget _buildList(List<DetailOrder> orders) {
    return ListView.builder(
      key: const ValueKey("done"),
      padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 0.0),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        final order = orders[index];
        return OrderItem(
          isShimmer: false,
          loginResponse: loginResponse,
          detailOrder: order,
          onFinish: () => onOrderFinished?.call(order.order.id),
        );
      },
    );
  }
}
