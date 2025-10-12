import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class Header extends StatelessWidget {
  final DetailOrder detailOrder;
  final ValueNotifier<double> distance;
  final ValueNotifier<double> estimated;
  final ValueNotifier<bool> loading;

  const Header({
    super.key,
    required this.detailOrder,
    required this.distance,
    required this.estimated,
    required this.loading,
  });

  @override
  Widget build(BuildContext context) {
    final order = detailOrder.order;

    return Container(
      padding: EdgeInsets.all(16),
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border(bottom: BorderSide(color: AppColors.gray_DADFE7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row header code + status
          Row(
            children: [
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: SvgPicture.asset(
                  "assets/images/ic_back.svg",
                  colorFilter: ColorFilter.mode(AppColors.blue_344256, BlendMode.srcIn),
                  width: 19,
                  height: 19,
                ),
                splashRadius: 20,
                padding: EdgeInsets.zero,
              ),
              SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(order.code,
                      style: TextStyle(fontFamily: "Inter_bold", fontSize: 19, color: AppColors.blue_344256)),
                  Text(AppStrings.delivery_details,
                      style: TextStyle(fontFamily: "Inter_regular", fontSize: 13, color: AppColors.gray_7B899D)),
                ],
              ),
              SizedBox(width: 12),
              Expanded(
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: order.shippingStatus == ShippingStatus.SHIPPING
                          ? ShippingStatus.SHIPPING.color
                          : ShippingStatus.PICKUP_REQUESTED.color,
                      borderRadius: BorderRadius.circular(9999),
                    ),
                    child: Text(
                      order.shippingStatus.name,
                      style: TextStyle(fontSize: 12, color: AppColors.white),
                    ),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 21),
          DistanceTimeBuilder(
            first: distance,
            second: estimated,
            third: loading,
            builder: (context, dist, time, isLoading, _) {
              return Row(
                children: [
                  Expanded(
                    child: buildHeader(
                        "${NumberFormat.decimalPattern('vi').format(order.cod + order.shippingCost)}đ",
                        AppStrings.income,
                        AppColors.green_22C35D,
                        false),
                  ),
                  Expanded(child: buildHeader("$dist ${AppStrings.km}", AppStrings.distance, AppColors.blue_344256, isLoading)),
                  Expanded(child: buildHeader("$time ${AppStrings.minute}", AppStrings.estimated, AppColors.blue_344256, isLoading)),
                ],
              );
            },
          ),
          SizedBox(height: 17),
        ],
      ),
    );
  }
}

/// Builder cho 2 giá trị: distance và time
class DistanceTimeBuilder<A, B, C> extends StatelessWidget {
  final ValueNotifier<A> first;
  final ValueNotifier<B> second;
  final ValueNotifier<C> third;
  final Widget Function(BuildContext, A, B, C, Widget?) builder;

  const DistanceTimeBuilder({
    super.key,
    required this.first,
    required this.second,
    required this.third,
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<A>(
      valueListenable: first,
      builder: (context, valueA, _) {
        return ValueListenableBuilder<B>(
          valueListenable: second,
          builder: (context, valueB, _) {
            return ValueListenableBuilder<C>(
              valueListenable: third,
              builder: (context, valueC, child) {
                return builder(context, valueA, valueB, valueC, child);
              },
            );
          },
        );
      },
    );
  }
}

// HEADER COLUMN ITEM
Widget buildHeader(String myText, String title, Color color, bool isLoading) {
  return Column(
    children: [
      isLoading
          ? SizedBox(
              key: const ValueKey("loading"),
              height: 30,
              child: Lottie.asset(
                'assets/animation/ani_load.json',
                fit: BoxFit.contain,
                repeat: true,
              ),
            )
          : Text(
              key: ValueKey("content"),
              myText,
              style: TextStyle(
                fontSize: 17,
                color: color,
                fontFamily: "Inter_bold",
              ),
            ),
      SizedBox(height: 5),
      Text(
        title,
        style: TextStyle(
          fontSize: 11,
          color: AppColors.gray_7B899D,
          fontFamily: "Inter_regular",
        ),
      ),
    ],
  );
}
