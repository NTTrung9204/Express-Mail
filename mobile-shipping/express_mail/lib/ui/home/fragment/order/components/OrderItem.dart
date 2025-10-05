import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/ui/detailorder/DetailOrderActivity.dart';

class OrderItem extends StatelessWidget {
  final DetailOrder detailOrder;
  const OrderItem({super.key, required this.detailOrder});

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
            color: AppColors.gray_DADFE7,
            blurRadius: 2,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Code + status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                detailOrder.order.code,
                style: const TextStyle(
                  fontFamily: "Inter_bold",
                  fontSize: 13,
                  color: AppColors.blue_344256,
                ),
              ),
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: detailOrder.order.shippingStatus.color,
                  borderRadius: BorderRadius.circular(9999),
                ),
                child: Text(
                  detailOrder.order.shippingStatus.name,
                  style:
                  const TextStyle(fontSize: 12, color: AppColors.white),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Địa chỉ
          _buildAddressInfo(),

          const SizedBox(height: 6),

          // Tổng tiền
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              "${AppStrings.total_amount}: ${NumberFormat.decimalPattern('vi').format(detailOrder.order.cod + detailOrder.order.shippingCost)}đ",
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
                child: TextButton(
                  style: TextButton.styleFrom(
                    backgroundColor: AppColors.gray_EDEFF3,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 11),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            DetailOrderActivity(detailOrder: detailOrder),
                      ),
                    );
                  },
                  child: const Text(
                    AppStrings.see_details,
                    style: TextStyle(
                      fontFamily: "Inter_regular",
                      fontSize: 13,
                      color: AppColors.blue_344256,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: TextButton(
                  style: TextButton.styleFrom(
                    backgroundColor:
                    (detailOrder.order.shippingStatus == ShippingStatus.SHIPPING)
                        ? AppColors.green_22C35D
                        : AppColors.orange_FA832E,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 11),
                  ),
                  onPressed: () {},
                  child: Text(
                    (detailOrder.order.shippingStatus == ShippingStatus.SHIPPING)
                        ? AppStrings.finish
                        : AppStrings.application_received,
                    style: const TextStyle(
                      fontFamily: "Inter_regular",
                      fontSize: 13,
                      color: AppColors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAddressInfo() {
    final isShipping =
        detailOrder.order.shippingStatus == ShippingStatus.SHIPPING;
    final title = isShipping ? AppStrings.delivery : AppStrings.get_goods;
    final address = isShipping
        ? "${detailOrder.order.receiverAddress}, ${detailOrder.order.receiverWardCommune}, ${detailOrder.order.receiverProvinceCity}"
        : "${detailOrder.shopOwner.address}, ${detailOrder.shopOwner.wardCommune}, ${detailOrder.shopOwner.provinceCity}";
    final phone =
    isShipping ? detailOrder.order.receiverPhone : detailOrder.shopOwner.phone;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          SvgPicture.asset(
            "assets/images/ic_address.svg",
            colorFilter:
            const ColorFilter.mode(AppColors.gray_7B899D, BlendMode.srcIn),
            width: 13,
            height: 13,
          ),
          const SizedBox(width: 5),
          Expanded(
            child: Text(
              "$title: $address",
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.gray_7B899D,
              ),
            ),
          ),
        ]),
        const SizedBox(height: 4),
        Row(children: [
          SvgPicture.asset(
            "assets/images/ic_phone.svg",
            colorFilter:
            const ColorFilter.mode(AppColors.gray_7B899D, BlendMode.srcIn),
            width: 13,
            height: 13,
          ),
          const SizedBox(width: 5),
          Text(
            "${AppStrings.phone_number}: $phone",
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.gray_7B899D,
            ),
          ),
        ]),
      ],
    );
  }
}
