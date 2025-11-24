import 'package:express_mail/ui/detailorder/DetailOrderViewModel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class Header extends StatefulWidget {
  final DetailOrderViewModel viewModel;

  const Header({super.key, required this.viewModel});

  @override
  State<Header> createState() => _HeaderState();
}

class _HeaderState extends State<Header> {
  @override
  void initState() {
    super.initState();
    widget.viewModel.addListener(_onViewModelChanged);
  }

  void _onViewModelChanged() => setState(() {});

  @override
  void dispose() {
    widget.viewModel.removeListener(_onViewModelChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = widget.viewModel;
    final detailOrder = viewModel.detailOrder;

    return Container(
      padding: const EdgeInsets.all(16),
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
                  colorFilter: ColorFilter.mode(
                    AppColors.blue_344256,
                    BlendMode.srcIn,
                  ),
                  width: 19,
                  height: 19,
                ),
                splashRadius: 20,
                padding: EdgeInsets.zero,
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    detailOrder.code,
                    style: const TextStyle(
                      fontFamily: "Inter_bold",
                      fontSize: 19,
                      color: AppColors.blue_344256,
                    ),
                  ),
                  Text(
                    AppStrings.delivery_details,
                    style: const TextStyle(
                      fontFamily: "Inter_regular",
                      fontSize: 13,
                      color: AppColors.gray_7B899D,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              // Expanded(
              //   child: Align(
              //     alignment: Alignment.centerRight,
              //     child: Container(
              //       padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              //       decoration: BoxDecoration(
              //         color: detailOrder.shippingStatus.color,
              //         borderRadius: BorderRadius.circular(9999),
              //       ),
              //       child: Text(
              //         detailOrder.shippingStatus.name,
              //         style: const TextStyle(fontSize: 12, color: AppColors.white),
              //       ),
              //     ),
              //   ),
              // ),
            ],
          ),
          const SizedBox(height: 21),
          Row(
            children: [
              Expanded(
                child: buildHeader(
                  "${NumberFormat.decimalPattern('vi').format(detailOrder.cod + detailOrder.shippingCost)}đ",
                  AppStrings.income,
                  AppColors.green_22C35D,
                  false,
                ),
              ),
              Expanded(
                child: buildHeader(
                  viewModel.loading
                      ? ""
                      : "${(viewModel.distance / 1000).toStringAsFixed(1)} ${AppStrings.km}",
                  AppStrings.distance,
                  AppColors.blue_344256,
                  viewModel.loading,
                ),
              ),
              Expanded(
                child: buildHeader(
                  viewModel.loading
                      ? ""
                      : "${formatDuration(viewModel.estimated ~/ 60)}",
                  AppStrings.estimated,
                  AppColors.blue_344256,
                  viewModel.loading,
                ),
              ),
            ],
          ),
          const SizedBox(height: 17),
        ],
      ),
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
        key: const ValueKey("content"),
        myText,
        style: TextStyle(
          fontSize: 17,
          color: color,
          fontFamily: "Inter_bold",
        ),
      ),
      const SizedBox(height: 5),
      Text(
        title,
        style: const TextStyle(
          fontSize: 11,
          color: AppColors.gray_7B899D,
          fontFamily: "Inter_regular",
        ),
      ),
    ],
  );
}

String formatDuration(int totalMinutes) {
  if (totalMinutes < 60) {
    return "$totalMinutes ${AppStrings.minute}";
  } else {
    final hours = totalMinutes ~/ 60;
    final minutes = totalMinutes % 60;
    return "$hours ${AppStrings.hours}${minutes > 0 ? " $minutes ${AppStrings.minute}" : ""}";
  }
}
