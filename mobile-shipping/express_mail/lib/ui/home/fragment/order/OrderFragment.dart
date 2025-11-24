import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/ShippingPlan.dart';
import 'package:express_mail/ui/home/fragment/order/components/OrderPlan.dart';
import 'package:flutter/material.dart';
import 'OrderViewModel.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class OrderFragment extends StatefulWidget {
  final LoginResponse loginResponse;

  const OrderFragment({super.key, required this.loginResponse});

  @override
  State<OrderFragment> createState() => _OrderFragmentState();
}

class _OrderFragmentState extends State<OrderFragment>
    with SingleTickerProviderStateMixin {
  late final OrderViewModel viewModel;
  late TabController _tabController;

  DateTime startDate = DateTime.now();
  DateTime endDate = DateTime.now();

  late TextEditingController fromController;
  late TextEditingController toController;

  @override
  void initState() {
    super.initState();
    viewModel = OrderViewModel();
    _tabController = TabController(length: 2, vsync: this);
    _fetchData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    viewModel.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    try {
      await Future.wait([
        viewModel.getListOrderPickup(
          widget.loginResponse,
          _formatDate(startDate),
          _formatDate(endDate.add(const Duration(days: 1))),
        ),
        viewModel.getListOrderDelivery(
          widget.loginResponse,
          _formatDate(startDate),
          _formatDate(endDate.add(const Duration(days: 1))),
        ),
      ]);
    } catch (e) {
      debugPrint("Fetch data error: $e");
    }
  }

  String _formatDate(DateTime date) {
    return "${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}";
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
                _buildTabBar(),
                Expanded(child: _buildTabBarView()),
              ],
            ),
          ),
        );
      },
    );
  }

  // ---------------------- HEADER -----------------------

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      width: double.infinity,
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(
          bottom: BorderSide(color: AppColors.gray_DADFE7, width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppStrings.order,
                style: TextStyle(
                  fontFamily: "Inter_bold",
                  fontSize: 23,
                  color: AppColors.blue_344256,
                ),
              ),
              SizedBox(height: 8),
              Text(
                AppStrings.manage_orders,
                style: TextStyle(
                  fontFamily: "Inter_regular",
                  fontSize: 15,
                  color: AppColors.gray_7B899D,
                ),
              ),
            ],
          ),

          GestureDetector(
            onTap: () => _openDateFilterDialog(),
            child: const Icon(
              Icons.calendar_month,
              size: 28,
              color: AppColors.blue_344256,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------- CALENDAR DIALOG -----------------------
  void _openDateFilterDialog() {
    DateTime tempStart = startDate;
    DateTime tempEnd = endDate;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setStateDialog) {
          return AlertDialog(
            backgroundColor: AppColors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            title: const Text(
              AppStrings.choose_a_time_period,
              style: TextStyle(
                fontSize: 18,
                fontFamily: "Inter_bold",
                color: AppColors.black,
              ),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // --- FROM DATE ---
                Card(
                  color: Colors.grey.shade100,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(10),
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: tempStart,
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2030),
                        builder: (context, child) {
                          return Theme(
                            data: Theme.of(context).copyWith(
                              colorScheme: const ColorScheme.light(
                                primary: AppColors.blue_127AE2,
                                onPrimary: Colors.white,
                                onSurface: Colors.black,
                              ),
                              dialogBackgroundColor: Colors.white,
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (picked != null) {
                        setStateDialog(() {
                          tempStart = picked;
                          if (tempEnd.isBefore(tempStart)) tempEnd = tempStart;
                        });
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 14,
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.calendar_today,
                            size: 18,
                            color: Colors.black,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            "${AppStrings.from}: ${_formatDate(tempStart)}",
                            style: TextStyle(
                              fontSize: 15,
                              fontFamily: "Inter_regular",
                              color: AppColors.black,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // --- TO DATE ---
                Card(
                  color: Colors.grey.shade100,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(10),
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: tempEnd,
                        firstDate: tempStart,
                        lastDate: DateTime(2030),
                        builder: (context, child) {
                          return Theme(
                            data: Theme.of(context).copyWith(
                              colorScheme: const ColorScheme.light(
                                primary: AppColors.blue_127AE2,
                                onPrimary: Colors.white,
                                onSurface: Colors.black,
                              ),
                              dialogBackgroundColor: Colors.white,
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (picked != null) {
                        setStateDialog(() {
                          tempEnd = picked;
                        });
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 14,
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.calendar_today,
                            size: 18,
                            color: Colors.black,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            "${AppStrings.to}: ${_formatDate(tempEnd)}",
                            style: TextStyle(
                              fontSize: 15,
                              fontFamily: "Inter_regular",
                              color: AppColors.black,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(
                  AppStrings.cancel,
                  style: TextStyle(
                    fontFamily: "Inter_regular",
                    fontSize: 14,
                    color: AppColors.black,
                  ),
                ),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    startDate = tempStart;
                    endDate = tempEnd;
                  });
                  Navigator.pop(context);
                  _fetchData();
                },
                child: Text(
                  AppStrings.confirm,
                  style: TextStyle(
                    fontFamily: "Inter_bold",
                    fontSize: 14,
                    color: AppColors.blue_127AE2,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // ---------------------- TAB BAR -----------------------

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white_EDEFF3,
        borderRadius: BorderRadius.circular(10),
      ),
      child: TabBar(
        controller: _tabController,
        indicatorColor: AppColors.blue_127AE2,
        labelColor: AppColors.blue_344256,
        unselectedLabelColor: AppColors.gray_7B899D,
        indicatorSize: TabBarIndicatorSize.tab,
        tabs: [_buildTab(AppStrings.delivery), _buildTab(AppStrings.receive)],
      ),
    );
  }

  Widget _buildTab(String text) {
    return Tab(
      child: Align(
        alignment: Alignment.center,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12.0),
          child: Text(
            text,
            style: const TextStyle(
              fontFamily: "Inter_medium",
              fontSize: 14,
              color: AppColors.blue_344256,
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------- TAB VIEW -----------------------

  Widget _buildTabBarView() {
    return TabBarView(
      controller: _tabController,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        RefreshIndicator(
          color: Colors.blue,
          backgroundColor: Colors.white,
          strokeWidth: 2,
          displacement: 5,
          onRefresh: () async => _fetchData(),
          child: _buildBatchList(
            viewModel.ordersDelivery,
            viewModel.isLoadingOrdersDelivery,
            true,
          ),
        ),
        RefreshIndicator(
          color: Colors.blue,
          backgroundColor: Colors.white,
          strokeWidth: 2,
          displacement: 5,
          onRefresh: () async => _fetchData(),
          child: _buildBatchList(
            viewModel.ordersPickup,
            viewModel.isLoadingOrdersPickup,
            false,
          ),
        ),
      ],
    );
  }

  // ---------------------- LIST BATCH -----------------------
  Widget _buildBatchList(
    List<ShippingPlan> batches,
    bool isLoading,
    bool isDelivery,
  ) {
    if (batches.isEmpty && !isLoading) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(60),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AspectRatio(
                aspectRatio: 1,
                child: Image.asset(
                  "assets/images/img_no_data.webp",
                  fit: BoxFit.contain,
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

    return ListView.builder(
      itemCount: batches.isEmpty || isLoading ? 5 : batches.length,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      itemBuilder: (context, index) {
        final batch = isLoading ? null : batches[index];
        return OrderPlan(
          loginResponse: widget.loginResponse,
          orderPlan: batch,
          index: index + 1,
          isShimmer: isLoading,
          isDelivery: isDelivery,
          onBatchEmpty: () {
            setState(() {
              batches.removeAt(index);
            });
          },
        );
      },
    );
  }
}
