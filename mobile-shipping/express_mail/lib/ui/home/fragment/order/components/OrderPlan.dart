import 'package:express_mail/data/model/ShippingPlan.dart';
import 'package:express_mail/ui/listorder/ListOderActivity.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shimmer/shimmer.dart';

class OrderPlan extends StatefulWidget {
  final LoginResponse loginResponse;
  final ShippingPlan? orderPlan;
  final int index;
  final bool isShimmer;

  const OrderPlan({
    super.key,
    required this.loginResponse,
    required this.orderPlan,
    required this.index,
    required this.isShimmer,
  });

  @override
  State<OrderPlan> createState() => _OrderPlanState();
}

class _OrderPlanState extends State<OrderPlan> {
  @override
  Widget build(BuildContext context) {
    if (widget.isShimmer) return _buildShimmer();
    if (widget.orderPlan == null) return const SizedBox();

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ListOrderActivity(
              loginResponse: widget.loginResponse,
              orders: widget.orderPlan!.orders,
              geometry: widget.orderPlan!.geometry,
            ),
          ),
        ).then((_) {
          if (mounted) setState(() {});
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(vertical: 19, horizontal: 17),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gray_DADFE7, width: 1),
          boxShadow: [
            BoxShadow(
              color: AppColors.gray_DADFE7,
              blurRadius: 2,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${AppStrings.batch} ${widget.index}",
                    style: const TextStyle(
                      fontFamily: "Inter_bold",
                      fontSize: 15,
                      color: AppColors.blue_344256,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      _infoItem(
                        Icons.date_range_outlined,
                        "${AppStrings.batch} ${widget.index}",
                      ),
                      _infoItem(
                        Icons.access_time,
                        "${AppStrings.batch} ${widget.index}",
                      ),
                      _infoItemSvg(
                        "assets/images/ic_delivered.svg",
                        "${widget.orderPlan!.orders.length} ${AppStrings.orders}",
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              color: AppColors.blue_344256,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoItem(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppColors.gray_7B899D, size: 18),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            fontFamily: "Inter_regular",
            fontSize: 13,
            color: AppColors.gray_7B899D,
          ),
        ),
      ],
    );
  }

  Widget _infoItemSvg(String asset, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SvgPicture.asset(
          asset,
          colorFilter: const ColorFilter.mode(
            AppColors.gray_7B899D,
            BlendMode.srcIn,
          ),
          width: 18,
          height: 18,
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            fontFamily: "Inter_regular",
            fontSize: 13,
            color: AppColors.gray_7B899D,
          ),
        ),
      ],
    );
  }

  Widget _buildShimmer() {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(vertical: 19, horizontal: 17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade300,
            blurRadius: 2,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Shimmer.fromColors(
        baseColor: Colors.grey.shade300,
        highlightColor: Colors.grey.shade100,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 120,
                    height: 15,
                    color: Colors.grey.shade300,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      _shimmerItem(width: 40, height: 18),
                      _shimmerItem(width: 40, height: 18),
                      _shimmerItem(width: 40, height: 18),
                    ],
                  ),
                ],
              ),
            ),
            Container(width: 20, height: 20, color: Colors.grey.shade300),
          ],
        ),
      ),
    );
  }

  Widget _shimmerItem({required double width, required double height}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: height, height: height, color: Colors.grey.shade300),
        const SizedBox(width: 4),
        Container(width: width, height: height, color: Colors.grey.shade300),
      ],
    );
  }
}
