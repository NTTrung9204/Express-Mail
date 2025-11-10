import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';
import 'package:intl/intl.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class Header extends StatelessWidget {
  final LoginResponse loginResponse;
  final double totalIncome;
  final int totalOrders;
  final bool isLoading;

  const Header({
    super.key,
    required this.loginResponse,
    required this.totalIncome,
    required this.totalOrders,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.blue_127AE2, AppColors.blue_5AA6F2],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "${AppStrings.hello} ${loginResponse.user.fullName}!",
            style: const TextStyle(
              fontFamily: "Inter_bold",
              fontSize: 19,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            AppStrings.ready_to_start_shipping,
            style: const TextStyle(
              fontFamily: "Inter_regular",
              fontSize: 15,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStat(
                  iconPath: "assets/images/ic_earning.svg",
                  value: totalIncome > 0
                      ? "${NumberFormat.decimalPattern('vi').format(totalIncome)}đ"
                      : "0đ",
                  label: AppStrings.earned,
                  isLoading: isLoading,
                  keyLoading: const ValueKey("loading_income"),
                  keyContent: const ValueKey("content_income"),
                ),
              ),
              Expanded(
                child: _buildStat(
                  iconPath: "assets/images/ic_delivered.svg",
                  value: "$totalOrders",
                  label: AppStrings.delivered,
                  isLoading: isLoading,
                  keyLoading: const ValueKey("loading_orders"),
                  keyContent: const ValueKey("content_orders"),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStat({
    required String iconPath,
    required String value,
    required String label,
    required bool isLoading,
    required Key keyLoading,
    required Key keyContent,
  }) {
    return Column(
      children: [
        SvgPicture.asset(
          iconPath,
          colorFilter: const ColorFilter.mode(AppColors.white, BlendMode.srcIn),
          width: 28,
          height: 28,
        ),
        const SizedBox(height: 8),
        isLoading
            ? SizedBox(
                key: keyLoading,
                height: 31,
                child: Lottie.asset(
                  'assets/animation/ani_load.json',
                  fit: BoxFit.contain,
                  repeat: true,
                ),
              )
            : Text(
                key: keyContent,
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontFamily: "Inter_bold",
                ),
              ),
        const SizedBox(height: 4),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 12,
            fontFamily: "Inter_regular",
            color: AppColors.white_80,
          ),
        ),
      ],
    );
  }
}
