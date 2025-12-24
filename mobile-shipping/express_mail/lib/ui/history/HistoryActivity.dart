import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'HistoryViewModel.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:shimmer/shimmer.dart';

class HistoryActivity extends StatefulWidget {
  final LoginResponse loginResponse;
  final String rangeType;

  const HistoryActivity({
    super.key,
    required this.loginResponse,
    required this.rangeType,
  });

  @override
  State<HistoryActivity> createState() => _HistoryActivityState();
}

class _HistoryActivityState extends State<HistoryActivity> {
  late final HistoryViewModel viewModel;
  final ScrollController _scrollController = ScrollController();

  DateTime? _fromDate;
  DateTime? _toDate;

  @override
  void initState() {
    super.initState();

    initializeDateFormatting('vi', null);

    viewModel = HistoryViewModel();

    _initDateRange();
    _fetchHistory();
  }

  void _initDateRange() {
    final now = DateTime.now();
    switch (widget.rangeType) {
      case "day":
        _fromDate = now;
        _toDate = now;
        break;
      case "week":
        _fromDate = now.subtract(Duration(days: now.weekday - 1));
        _toDate = now;
        break;
      case "month":
        _fromDate = DateTime(now.year, now.month, 1);
        _toDate = now;
        break;
    }
  }

  Future<void> _fetchHistory() async {
    await viewModel.fetchHistory(
      widget.loginResponse,
      rangeType: widget.rangeType,
      fromDate: _fromDate,
      toDate: _toDate,
    );
  }

  void _showDateRangeDialog(BuildContext context) async {
    DateTime firstDay;
    DateTime lastDay = DateTime.now();

    if (widget.rangeType == "week") {
      final now = DateTime.now();
      firstDay = now.subtract(Duration(days: now.weekday - 1));
      lastDay = firstDay.add(const Duration(days: 6));
    } else if (widget.rangeType == "month") {
      final now = DateTime.now();
      firstDay = DateTime(now.year, now.month, 1);
      lastDay = DateTime(now.year, now.month + 1, 0);
    } else {
      firstDay = DateTime(2020, 1, 1);
    }

    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: firstDay,
      lastDate: lastDay,
      locale: const Locale('vi'),
      initialDateRange: (_fromDate != null && _toDate != null)
          ? DateTimeRange(start: _fromDate!, end: _toDate!)
          : null,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppColors.green_22C35D,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black87,
              secondary: AppColors.green_22C35D.withValues(
                alpha: 0.2,
              ), // highlight range
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: AppColors.black,
                textStyle: const TextStyle(
                  fontFamily: "Inter_medium",
                  color: AppColors.black,
                  fontSize: 18,
                ),
              ),
            ),
            cardColor: Colors.white,
            textTheme: const TextTheme(
              titleLarge: TextStyle(
                color: Colors.black,
                fontFamily: "Inter_medium",
                fontSize: 18,
              ),
              bodyLarge: TextStyle(
                color: Colors.black,
                fontFamily: "Inter_medium",
              ),
              bodyMedium: TextStyle(color: Colors.black),
            ),
            highlightColor: AppColors.blue_127AE2.withValues(alpha: 0.2),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _fromDate = picked.start;
        _toDate = picked.end;
        _fetchHistory();
      });
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    viewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white_F8F7FC,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(child: _buildHistoryList()),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        border: const Border(
          bottom: BorderSide(color: AppColors.white_E2E8F0, width: 1.0),
        ),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: () => Navigator.of(context).pop(),
            borderRadius: BorderRadius.circular(24),
            child: const Padding(
              padding: EdgeInsets.all(8.0),
              child: Icon(
                Icons.arrow_back,
                color: AppColors.blue_344256,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 8),
          const Text(
            AppStrings.order_history,
            style: TextStyle(
              fontFamily: "Inter_bold",
              fontSize: 18,
              color: AppColors.blue_344256,
            ),
          ),
          const Spacer(),
          if (widget.rangeType != "day")
            IconButton(
              icon: const Icon(
                Icons.calendar_today,
                color: AppColors.blue_344256,
              ),
              onPressed: () => _showDateRangeDialog(context),
            ),
        ],
      ),
    );
  }

  Widget _buildHistoryList() {
    return AnimatedBuilder(
      animation: viewModel,
      builder: (context, _) {
        final histories = viewModel.histories;

        if (viewModel.isLoading) {
          return _buildShimmer();
        }

        return RefreshIndicator(
          color: Colors.blue,
          backgroundColor: Colors.white,
          strokeWidth: 2,
          displacement: 5,
          onRefresh: () async => _fetchHistory(),
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: histories.length,
            itemBuilder: (context, index) {
              if (index >= histories.length) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      color: AppColors.blue_127AE2,
                    ),
                  ),
                );
              }
              return _buildOrderCard(histories[index]);
            },
          ),
        );
      },
    );
  }

  Widget _buildOrderCard(DetailOrder order) {
    return InkWell(
      onTap: () {
        // Navigator.push(
        //   context,
        //   MaterialPageRoute(
        //     builder: (_) => DetailOrderActivity(
        //       loginResponse: widget.loginResponse,
        //       detailOrder: order,
        //     ),
        //   ),
        // );
      },
      child: Card(
        color: AppColors.white,
        margin: const EdgeInsets.only(bottom: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: BorderSide(color: AppColors.white_E2E8F0),
        ),
        elevation: 0,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 17, vertical: 19),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              //Code + Status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      SvgPicture.asset(
                        "assets/images/ic_delivered.svg",
                        colorFilter: const ColorFilter.mode(
                          AppColors.blue_344256,
                          BlendMode.srcIn,
                        ),
                        width: 20,
                        height: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        order.order.code.toString(),
                        style: const TextStyle(
                          fontSize: 14,
                          fontFamily: "Inter_bold",
                        ),
                      ),
                    ],
                  ),
                  // Container(
                  //   padding: const EdgeInsets.symmetric(
                  //     horizontal: 11,
                  //     vertical: 5,
                  //   ),
                  //   decoration: BoxDecoration(
                  //     color:
                  //         order.order.lastShipping?.status.color ??
                  //         AppColors.green_22C35D,
                  //     borderRadius: BorderRadius.circular(9999),
                  //   ),
                  //   child: Text(
                  //     order.order.lastShipping?.status.name ??
                  //         AppStrings.delivered,
                  //     style: const TextStyle(
                  //       color: AppColors.white,
                  //       fontSize: 12,
                  //       fontFamily: "Inter_regular",
                  //     ),
                  //   ),
                  // ),
                ],
              ),
              const SizedBox(height: 8),
              // Date
              Row(
                children: [
                  const Icon(
                    Icons.calendar_today_outlined,
                    size: 14,
                    color: Colors.grey,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    order.createdAt,
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.gray_7B899D,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              // Total
              Row(
                children: [
                  SvgPicture.asset(
                    "assets/images/ic_earning.svg",
                    colorFilter: ColorFilter.mode(
                      AppColors.green_22C35D,
                      BlendMode.srcIn,
                    ),
                    width: 16,
                    height: 16,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    "${NumberFormat.decimalPattern('vi').format(order.order.shippingCost)}đ",
                    style: const TextStyle(
                      fontSize: 13,
                      fontFamily: "Inter_medium",
                      color: AppColors.green_22C35D,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              // Items
              Row(
                children: [
                  const SizedBox(width: 4),
                  Text(
                    "${order.order.products.length} ${AppStrings.items}",
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.gray_7B899D,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 10,
      itemBuilder: (_, __) => Card(
        margin: const EdgeInsets.only(bottom: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: BorderSide(color: AppColors.white_E2E8F0),
        ),
        elevation: 0,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 17, vertical: 19),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade300,
            highlightColor: Colors.grey.shade100,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 20,
                          height: 20,
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 90,
                          height: 14,
                          color: Colors.grey.shade400,
                        ),
                      ],
                    ),
                    // Container(
                    //   width: 60,
                    //   height: 20,
                    //   color: Colors.grey.shade400,
                    // ),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  height: 14,
                  color: Colors.grey.shade400,
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  height: 14,
                  color: Colors.grey.shade400,
                ),
                const SizedBox(height: 8),
                Container(width: 70, height: 12, color: Colors.grey.shade400),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: Padding(
        padding: EdgeInsetsGeometry.all(45),
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
    );
  }
}
