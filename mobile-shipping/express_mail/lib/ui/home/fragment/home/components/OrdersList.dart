import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/ui/home/fragment/home/components/OrderItem.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/resources/strings.dart';

class OrdersList extends StatelessWidget {
  final List<ShippingOrder> orders;
  final bool isLoading;
  final bool isDelivery;
  final Future<void> Function()? onRefresh;
  final Function(ShippingOrder)? onGuide;
  final Function(ShippingOrder)? onFinish;

  const OrdersList({
    super.key,
    required this.orders,
    required this.isLoading,
    required this.isDelivery,
    this.onRefresh,
    this.onGuide,
    this.onFinish,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: Colors.blue,
      backgroundColor: Colors.white,
      strokeWidth: 2,
      displacement: 5,
      onRefresh: onRefresh ?? () async {},
      child: orders.isEmpty && !isLoading
          ? Padding(
              padding: const EdgeInsets.all(30),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 30),
                      child: AspectRatio(
                        aspectRatio: 1,
                        child: Image.asset(
                          "assets/images/img_no_data.webp",
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      AppStrings.no_order_data,
                      style: TextStyle(color: Colors.black54, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          : ListView.builder(
              itemCount: isLoading ? 5 : orders.length,
              itemBuilder: (context, index) {
                final order = isLoading ? null : orders[index];
                return OrderItem(
                  isLoading: isLoading,
                  detailOrder: order,
                  isDelivery: isDelivery,
                  onGuidePressed: order != null
                      ? () => onGuide?.call(order)
                      : null,
                  onFinishPressed: order != null
                      ? () => onFinish?.call(order)
                      : null,
                );
              },
            ),
    );
  }
}
