import 'package:express_mail/ui/detailorder/DetailOrderActivity.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'HistoryViewModel.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:intl/intl.dart';
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

  @override
  void initState() {
    super.initState();
    viewModel = HistoryViewModel();
    _fetchHistory();

    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
              _scrollController.position.maxScrollExtent - 100 &&
          !viewModel.isLoadingMore &&
          viewModel.hasMoreData) {
        _fetchHistory(loadMore: true);
      }
    });
  }

  void _fetchHistory({bool loadMore = false}) {
    viewModel.fetchHistory(
      widget.loginResponse,
      loadMore: loadMore,
      rangeType: widget.rangeType,
    );
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
            _buildHeader(context),
            Expanded(child: _buildHistoryList()),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
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
              child: Icon(Icons.arrow_back, color: AppColors.blue_344256, size: 20,),
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
        ],
      ),
    );
  }

  Widget _buildHistoryList() {
    return AnimatedBuilder(
      animation: viewModel,
      builder: (context, _) {
        final histories = viewModel.histories;

        if (viewModel.isLoading && histories.isEmpty) {
          return _buildShimmer();
        }

        if (histories.isEmpty) {
          return  Center(
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
          );
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
            itemCount: histories.length + (viewModel.hasMoreData ? 1 : 0),
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
              final item = histories[index];
              return _buildOrderCard(item);
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
        margin: const EdgeInsets.only(bottom: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: AppColors.white_E2E8F0),
        ),
        elevation: 0.5,
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
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 11,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: order.status.color,
                      borderRadius: BorderRadius.circular(9999),
                    ),
                    child: Text(
                      order.status.name,
                      style: TextStyle(
                        color: AppColors.white,
                        fontSize: 12,
                        fontFamily: "Inter_regular",
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              //Date
              // Row(
              //   children: [
              //     const Icon(
              //       Icons.calendar_today_outlined,
              //       size: 14,
              //       color: Colors.grey,
              //     ),
              //     const SizedBox(width: 4),
              //     Text(
              //       "123123",
              //       style: const TextStyle(fontSize: 12, color: Colors.grey),
              //     ),
              //   ],
              // ),
              // const SizedBox(height: 8),

              //Total
              Row(
                children: [
                  SvgPicture.asset(
                    "assets/images/ic_earning.svg",
                    colorFilter: ColorFilter.mode(
                      AppColors.blue_344256,
                      BlendMode.srcIn,
                    ),
                    width: 16,
                    height: 16,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    "${NumberFormat.decimalPattern('vi').format(order.order.shippingCost)}đ",
                    style: const TextStyle(
                      fontSize: 14,
                      fontFamily: "Inter_medium",
                      color: AppColors.blue_344256,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              //Items
              Row(
                children: [
                  Text(
                    "${order.products.length} ${AppStrings.items}",
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
        color: AppColors.white,
        margin: const EdgeInsets.only(bottom: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: AppColors.white_E2E8F0),
        ),
        elevation: 1,
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
                          decoration: BoxDecoration(
                            color: Colors.grey.shade400,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 90,
                          height: 14,
                          color: Colors.grey.shade400,
                        ),
                      ],
                    ),
                    Container(
                      width: 60,
                      height: 20,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade400,
                        borderRadius: BorderRadius.circular(9999),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Container(
                      width: 16,
                      height: 16,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 110,
                      height: 14,
                      color: Colors.grey.shade400,
                    ),
                  ],
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
}
