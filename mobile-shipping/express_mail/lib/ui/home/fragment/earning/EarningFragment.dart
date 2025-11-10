import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/ui/history/HistoryActivity.dart';
import 'package:express_mail/ui/home/fragment/earning/EarningViewModel.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:shimmer/shimmer.dart';

class EarningFragment extends StatefulWidget {
  final LoginResponse loginResponse;

  const EarningFragment({super.key, required this.loginResponse});

  @override
  State<EarningFragment> createState() => _EarningFragmentState();
}

class _EarningFragmentState extends State<EarningFragment> {
  late final EarningViewModel viewModel;
  String selectedTab = AppStrings.today;

  @override
  void initState() {
    super.initState();
    viewModel = EarningViewModel();
    _fetchData("day");
  }

  void _fetchData(String rangeType) {
    viewModel.fetchFinishedOrdersByRange(
      widget.loginResponse,
      rangeType: rangeType,
    );
  }

  @override
  void dispose() {
    viewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: viewModel,
      builder: (context, _) {
        return Scaffold(
          backgroundColor: AppColors.white_F8F7FC,
          body: SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                const SizedBox(height: 8),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                    // 🔹 padding trong Column
                    child: _buildTransactions(),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  ///HEADER
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.green_22C35D, AppColors.green_3CDD77],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.earning,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 23,
                      fontFamily: "Inter_bold",
                    ),
                  ),
                  Text(
                    AppStrings.track_your_earnings,
                    style: TextStyle(
                      color: AppColors.white_80,
                      fontSize: 15,
                      fontFamily: "Inter_regular",
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.download_outlined, size: 20),
                label: const Text(
                  AppStrings.export,
                  style: TextStyle(fontSize: 13, fontFamily: "Inter_regular"),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.white_10,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: AppColors.white_20),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 13,
                    vertical: 10,
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Tabs
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [AppStrings.today, AppStrings.week, AppStrings.month].map(
              (label) {
                final isSelected = selectedTab == label;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: TextButton(
                    style: TextButton.styleFrom(
                      backgroundColor: isSelected
                          ? Colors.white
                          : AppColors.white_10,
                      foregroundColor: isSelected
                          ? AppColors.green_22C35D
                          : AppColors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 11,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: const BorderSide(
                          color: AppColors.white_20,
                          width: 1,
                        ),
                      ),
                    ),
                    onPressed: () {
                      setState(() => selectedTab = label);
                      String rangeType = "day";
                      if (label == AppStrings.week) rangeType = "week";
                      if (label == AppStrings.month) rangeType = "month";
                      _fetchData(rangeType);
                    },
                    child: Text(
                      label,
                      style: const TextStyle(
                        fontFamily: "Inter_regular",
                        fontSize: 13,
                      ),
                    ),
                  ),
                );
              },
            ).toList(),
          ),

          const SizedBox(height: 10),

          // Main Earnings
          Center(
            child: Column(
              children: [
                viewModel.isLoading
                    ? SizedBox(
                        key: const ValueKey("loading"),
                        height: 31,
                        child: Lottie.asset(
                          'assets/animation/ani_load.json',
                          fit: BoxFit.contain,
                          repeat: true,
                        ),
                      )
                    : Text(
                        key: ValueKey("content"),
                        viewModel.totalIncome > 0
                            ? "${NumberFormat.decimalPattern('vi').format(viewModel.totalIncome)}đ"
                            : "0đ",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontFamily: "Inter_bold",
                        ),
                      ),
                const SizedBox(height: 6),
                viewModel.isLoading
                    ? SizedBox(
                        key: const ValueKey("loading order"),
                        height: 20,
                        child: Lottie.asset(
                          'assets/animation/ani_load.json',
                          fit: BoxFit.contain,
                          repeat: true,
                        ),
                      )
                    : Text(
                        key: ValueKey("content order"),
                        "${viewModel.totalOrders} ${AppStrings.delivery_order}",
                        style: const TextStyle(
                          color: AppColors.white_80,
                          fontSize: 13,
                          fontFamily: "Inter_regular",
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactions() {
    final finishOrders = viewModel.finishOrders;

    return RefreshIndicator(
      color: Colors.blue,
      backgroundColor: Colors.white,
      strokeWidth: 2,
      displacement: 5,
      onRefresh: () async {
        String rangeType = "day";
        if (selectedTab == AppStrings.week) rangeType = "week";
        if (selectedTab == AppStrings.month) rangeType = "month";
        _fetchData(rangeType);
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gray_DADFE7, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(25),
        child: viewModel.isLoading
            ? Shimmer.fromColors(
                baseColor: AppColors.gray_DADFE7,
                highlightColor: AppColors.white_F8F7FC,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(width: 30, height: 30, color: Colors.white),
                        const SizedBox(width: 8),
                        Container(width: 220, height: 30, color: Colors.white),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: ListView.separated(
                        itemCount: 5,
                        separatorBuilder: (_, __) => const Divider(height: 8),
                        itemBuilder: (_, __) => _transactionItemShimmer(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ],
                ),
              )
            : finishOrders.isEmpty
            ? ListView(
                children: [
                  Center(
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
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    children: [
                      Icon(
                        Icons.history_outlined,
                        size: 30,
                        color: AppColors.blue_127AE2,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        AppStrings.history_delivery,
                        style: TextStyle(
                          fontSize: 24,
                          fontFamily: "Inter_bold",
                          color: AppColors.blue_344256,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // List
                  Expanded(
                    child: ListView.separated(
                      itemCount: finishOrders.length,
                      separatorBuilder: (_, __) => const Divider(height: 8),
                      itemBuilder: (context, index) {
                        final order = finishOrders[index];
                        return _transactionItem(
                          "#${order.order.code}",
                          "+${NumberFormat.decimalPattern('vi').format(order.order.shippingCost)}đ",
                          AppStrings.finish,
                          ShippingStatus.FINISHED.color,
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 12),

                  // View All Button
                  Row(
                    children: [
                      Expanded(
                        child: TextButton(
                          style: TextButton.styleFrom(
                            backgroundColor: AppColors.white_F8F7FC,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                              side: BorderSide(
                                color: AppColors.gray_EDEFF3,
                                width: 1,
                              ),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 11),
                          ),
                          onPressed: () {
                            String rangeType = "day";
                            if (selectedTab == AppStrings.week) {
                              rangeType = "week";
                            }
                            if (selectedTab == AppStrings.month) {
                              rangeType = "month";
                            }
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => HistoryActivity(
                                  loginResponse: widget.loginResponse,
                                  rangeType: rangeType,
                                ),
                              ),
                            );
                          },
                          child: const Text(
                            AppStrings.view_all,
                            style: TextStyle(
                              fontFamily: "Inter_regular",
                              fontSize: 13,
                              color: AppColors.blue_344256,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
      ),
    );
  }

  ///SHIMMER ITEM
  Widget _transactionItemShimmer() {
    return Padding(
      padding: const EdgeInsets.only(top: 20.0, bottom: 24.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 80,
                height: 13,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 4),
              Container(
                width: 50,
                height: 11,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
          ),
          Container(
            width: 60,
            height: 14,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ],
      ),
    );
  }

  ///TRANSACTION ITEM
  Widget _transactionItem(
    String title,
    String amount,
    String status,
    Color color,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(
          title,
          style: TextStyle(
            fontFamily: "Inter_regular",
            fontSize: 13,
            color: AppColors.blue_344256,
          ),
        ),
        subtitle: Text(
          status,
          style: TextStyle(
            color: color,
            fontSize: 11,
            fontFamily: "Inter_bold",
          ),
        ),
        trailing: Text(
          amount,
          style: TextStyle(
            color: color,
            fontFamily: "Inter_bold",
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
