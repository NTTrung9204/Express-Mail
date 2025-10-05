import 'package:express_mail/ui/home/fragment/order/components/OrderItem.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:lottie/lottie.dart';

class OrderList extends StatelessWidget {
  final ValueNotifier<List<DetailOrder>> detailOrderNotifier;
  final ValueNotifier<bool> loading;

  const OrderList({
    super.key,
    required this.detailOrderNotifier,
    required this.loading,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder2<List<DetailOrder>, bool>(
      first: detailOrderNotifier,
      second: loading,
      builder: (context, orders, isLoading, _) {
        if (isLoading) {
          return Center(
            key: const ValueKey("loading"),
            child: Lottie.asset(
              "assets/animation/ani_loading_order.json",
              fit: BoxFit.contain,
              repeat: true,
            ),
          );
        } else {
          if (orders.isEmpty) {
            return Center(
              key: const ValueKey("empty"),
              child: Lottie.asset(
                "assets/animation/ani_empty.json",
                fit: BoxFit.contain,
                repeat: true,
              ),
            );
          } else {
            return ListView.builder(
              key: const ValueKey("done"),
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                return OrderItem(detailOrder: orders[index]);
              },
            );
          }
        }
      },
    );
  }
}


/// Custom ValueListenableBuilder cho 2 ValueNotifier
class ValueListenableBuilder2<A, B> extends StatelessWidget {
  final ValueNotifier<A> first;
  final ValueNotifier<B> second;
  final Widget Function(BuildContext, A, B, Widget?) builder;

  const ValueListenableBuilder2({
    super.key,
    required this.first,
    required this.second,
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<A>(
      valueListenable: first,
      builder: (context, valueA, _) {
        return ValueListenableBuilder<B>(
          valueListenable: second,
          builder: (context, valueB, child) {
            return builder(context, valueA, valueB, child);
          },
        );
      },
    );
  }
}

