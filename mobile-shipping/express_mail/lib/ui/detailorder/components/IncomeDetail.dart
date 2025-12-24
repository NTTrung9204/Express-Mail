import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:intl/intl.dart';

class IncomeDetail extends StatelessWidget {
  final ShippingOrder detailOrder;

  const IncomeDetail({super.key, required this.detailOrder});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: EdgeInsets.symmetric(horizontal: 18, vertical: 8),
      padding: EdgeInsets.all(25),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: BoxBorder.all(color: AppColors.gray_DADFE7, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray_DADFE7,
            blurRadius: 2,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SvgPicture.asset(
                "assets/images/ic_earning.svg",
                colorFilter: const ColorFilter.mode(
                  AppColors.green_22C35D,
                  BlendMode.srcIn,
                ),
                width: 23,
                height: 23,
              ),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  AppStrings.income_details,
                  style: TextStyle(
                    color: AppColors.blue_344256,
                    fontFamily: "Inter_bold",
                    fontSize: 23,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  AppStrings.order_money,
                  style: TextStyle(
                    fontSize: 13,
                    fontFamily: "Inter_regular",
                    color: AppColors.gray_7B899D,
                  ),
                ),
              ),
              SizedBox(width: 8),
              Text(
                "${NumberFormat.decimalPattern('vi').format(detailOrder.cod)}đ",
                style: TextStyle(
                  fontSize: 13,
                  fontFamily: "Inter_regular",
                  color: AppColors.gray_7B899D,
                ),
                textAlign: TextAlign.right,
              ),
            ],
          ),
          SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Text(
                  AppStrings.shipping_money,
                  style: TextStyle(
                    fontSize: 13,
                    fontFamily: "Inter_regular",
                    color: AppColors.gray_7B899D,
                  ),
                ),
              ),
              SizedBox(width: 8),
              Text(
                "${NumberFormat.decimalPattern('vi').format(detailOrder.shippingCost)}đ",
                style: TextStyle(
                  fontSize: 13,
                  fontFamily: "Inter_regular",
                  color: AppColors.green_22C35D,
                ),
                textAlign: TextAlign.right,
              ),
            ],
          ),
          SizedBox(height: 8),
          Divider(color: AppColors.gray_DADFE7, thickness: 1, height: 1),
          SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(
                  AppStrings.total_income,
                  style: TextStyle(
                    fontSize: 13,
                    fontFamily: "Inter_regular",
                    color: AppColors.gray_7B899D,
                  ),
                ),
              ),
              SizedBox(width: 8),
              Text(
                "${NumberFormat.decimalPattern('vi').format(detailOrder.cod + detailOrder.shippingCost)}đ",
                style: TextStyle(
                  fontSize: 13,
                  fontFamily: "Inter_regular",
                  color: AppColors.green_22C35D,
                ),
                textAlign: TextAlign.right,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
