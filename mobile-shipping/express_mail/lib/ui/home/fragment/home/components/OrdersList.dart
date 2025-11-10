import 'package:express_mail/ui/home/fragment/home/components/OrderItem.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:lottie/lottie.dart';

class OrdersList extends StatelessWidget {
  final List<DetailOrder> orders;
  final bool isLoading;
  final Future<void> Function()? onRefresh;
  final Function(DetailOrder)? onGuide;
  final Function(DetailOrder)? onFinish;

  const OrdersList({
    super.key,
    required this.orders,
    required this.isLoading,
    this.onRefresh,
    this.onGuide,
    this.onFinish,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.gray_F7F7FC,
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: AppColors.white,
          border: Border.all(color: AppColors.gray_DADFE7, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                SvgPicture.asset(
                  "assets/images/ic_delivered.svg",
                  colorFilter: const ColorFilter.mode(
                    AppColors.blue_127AE2,
                    BlendMode.srcIn,
                  ),
                  width: 28,
                  height: 28,
                ),
                const SizedBox(width: 8),
                Text(
                  AppStrings.order,
                  style: const TextStyle(
                    color: AppColors.blue_344256,
                    fontFamily: "Inter_bold",
                    fontSize: 23,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Expanded(
              child: RefreshIndicator(
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
                            onGuidePressed: order != null
                                ? () => onGuide?.call(order)
                                : null,
                            onFinishPressed: order != null
                                ? () => onFinish?.call(order)
                                : null,
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
