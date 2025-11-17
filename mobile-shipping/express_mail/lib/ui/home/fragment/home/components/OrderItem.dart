import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:shimmer/shimmer.dart';

class OrderItem extends StatelessWidget {
  final ShippingOrder? detailOrder;
  final bool isLoading;
  final VoidCallback? onGuidePressed;
  final VoidCallback? onFinishPressed;

  const OrderItem({
    super.key,
    this.detailOrder,
    this.isLoading = false,
    this.onGuidePressed,
    this.onFinishPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray_DADFE7, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray_DADFE7.withAlpha(80),
            blurRadius: 2,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: isLoading ? _buildShimmer() : _buildContent(),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(height: 13, width: 60, color: Colors.grey[300]),
              Container(height: 12, width: 40, color: Colors.grey[300]),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            height: 13,
            width: double.infinity,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 4),
          Container(height: 13, width: 150, color: Colors.grey[300]),
          const SizedBox(height: 4),
          Container(height: 13, width: 120, color: Colors.grey[300]),
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: Container(height: 14, width: 80, color: Colors.grey[300]),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 40,
                  margin: const EdgeInsets.only(right: 6),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  height: 40,
                  margin: const EdgeInsets.only(left: 6),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final order = detailOrder!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ID & Status
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              order.code,
              style: const TextStyle(
                fontFamily: "Inter_bold",
                fontSize: 13,
                color: AppColors.blue_344256,
              ),
            ),
            // Container(
            //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            //   decoration: BoxDecoration(
            //     color: order.shippingStatus.color,
            //     borderRadius: BorderRadius.circular(8),
            //   ),
            //   child: Text(
            //     order.shippingStatus.name,
            //     style: const TextStyle(fontSize: 12, color: AppColors.white),
            //   ),
            // ),
          ],
        ),
        const SizedBox(height: 10),

        // Address
        Row(
          children: [
            SvgPicture.asset(
              "assets/images/ic_address.svg",
              colorFilter: const ColorFilter.mode(
                AppColors.gray_7B899D,
                BlendMode.srcIn,
              ),
              width: 13,
              height: 13,
            ),
            const SizedBox(width: 5),
            Expanded(
              child: Text(
                order.shippingStatus == ShippingStatus.SHIPPING
                    ? "${AppStrings.delivery} ${order.receiverAddress}, ${order.receiverWardCommune}, ${order.receiverProvinceCity}"
                    : "${AppStrings.get_goods} ${order.receiverAddress}, ${order.receiverWardCommune}, ${order.receiverProvinceCity}",
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.gray_7B899D,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),

        // Phone
        Row(
          children: [
            SvgPicture.asset(
              "assets/images/ic_phone.svg",
              colorFilter: const ColorFilter.mode(
                AppColors.gray_7B899D,
                BlendMode.srcIn,
              ),
              width: 13,
              height: 13,
            ),
            const SizedBox(width: 5),
            Expanded(
              child: Text(
                "${AppStrings.phone_number}: ${order.receiverPhone}",
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.gray_7B899D,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),

        // COD
        Align(
          alignment: Alignment.centerRight,
          child: Text(
            "${AppStrings.total_amount}: ${NumberFormat.decimalPattern('vi').format(order.cod + order.shippingCost)}đ",
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.green_22C35D,
              fontFamily: "Inter_bold",
            ),
          ),
        ),
        const SizedBox(height: 15),

        // Buttons
        Row(
          children: [
            Expanded(
              child: _buildButton(
                text: AppStrings.guide,
                iconPath: "assets/images/ic_guide.svg",
                gradient: const LinearGradient(
                  colors: [AppColors.blue_127AE2, AppColors.blue_5AA6F2],
                ),
                onPressed: onGuidePressed,
                textColor: AppColors.white,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildButton(
                text: AppStrings.finish,
                iconPath: "assets/images/ic_finish.svg",
                bgColor: AppColors.white_F8F7FC,
                borderColor: AppColors.white_EDEFF3,
                onPressed: onFinishPressed,
                textColor: AppColors.blue_344256,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildButton({
    required String text,
    required String iconPath,
    VoidCallback? onPressed,
    LinearGradient? gradient,
    Color? bgColor,
    Color? borderColor,
    Color? textColor,
  }) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        color: gradient == null ? bgColor : null,
        borderRadius: BorderRadius.circular(10),
        border: borderColor != null
            ? Border.all(color: borderColor, width: 1)
            : null,
      ),
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              iconPath,
              colorFilter: ColorFilter.mode(
                textColor ?? AppColors.white,
                BlendMode.srcIn,
              ),
              width: 13,
              height: 13,
            ),
            const SizedBox(width: 12),
            Flexible(
              child: Text(
                text,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: "Inter_regular",
                  fontSize: 13,
                  color: textColor ?? AppColors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
