import 'package:express_mail/ui/home/fragment/order/components/OrderItem.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:lottie/lottie.dart';

class OrderList extends StatelessWidget {
  final List<DetailOrder> orders;
  final bool isLoading;
  final Function(int orderId)? onOrderFinished;

  const OrderList({
    super.key,
    required this.orders,
    required this.isLoading,
    this.onOrderFinished,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) return _buildLoading();
    if (orders.isEmpty) return _buildEmpty();
    return _buildList(orders);
  }

  Widget _buildLoading() {
    return Center(
      key: const ValueKey("loading"),
      child: Padding(
        padding: const EdgeInsets.all(80.0),
        child: Lottie.asset(
          "assets/animation/ani_loading_order.json",
          fit: BoxFit.contain,
          repeat: true,
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      key: const ValueKey("empty"),
      child: Padding(
        padding: const EdgeInsets.all(80.0),
        child: Lottie.asset(
          "assets/animation/ani_empty.json",
          fit: BoxFit.contain,
          repeat: true,
        ),
      ),
    );
  }

  Widget _buildList(List<DetailOrder> orders) {
    return ListView.builder(
      key: const ValueKey("done"),
      padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 0.0),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        return OrderItem(
          detailOrder: orders[index],
          onFinish: () {
            if (onOrderFinished != null) {
              onOrderFinished!(orders[index].id);
            }
          },
        );
      },
    );
  }
}
