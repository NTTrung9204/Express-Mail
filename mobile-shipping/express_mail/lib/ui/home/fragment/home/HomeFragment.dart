import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/ui/home/fragment/home/components/Header.dart';
import 'package:express_mail/ui/home/fragment/home/components/OrdersList.dart';
import 'package:express_mail/ui/map/MapActivity.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/ui/home/fragment/home/HomeFragmentViewModel.dart';
import 'package:flutter_svg/flutter_svg.dart';

class HomeFragment extends StatefulWidget {
  final LoginResponse loginResponse;

  const HomeFragment({super.key, required this.loginResponse});

  @override
  State<HomeFragment> createState() => _HomeFragmentState();
}

class _HomeFragmentState extends State<HomeFragment>
    with TickerProviderStateMixin {
  late final HomeFragmentViewModel viewModel;
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    viewModel = HomeFragmentViewModel();
    _tabController = TabController(length: 2, vsync: this);
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      await Future.wait([
        viewModel.fetchFinishedOrdersToday(widget.loginResponse),
        viewModel.getListOrderPickup(widget.loginResponse),
        viewModel.getListOrderDelivery(widget.loginResponse),
      ]);
    } catch (e) {
      debugPrint("Fetch data error: $e");
    }
  }

  void _onGuidePressed(ShippingOrder order) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => MapActivity(order: order)),
    );
  }

  void _onFinishPressed(ShippingOrder order, bool isDeliveryTab) async {
    String? selectedStatus = ShippingStatus.FINISHED.key;

    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: AppColors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              title: const Text(
                AppStrings.order_confirmation,
                style: TextStyle(
                  fontFamily: "Inter_bold",
                  fontSize: 18,
                  color: AppColors.black,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildCustomRadio(
                    label: AppStrings.success,
                    value: ShippingStatus.FINISHED.key,
                    groupValue: selectedStatus,
                    onChanged: (value) =>
                        setState(() => selectedStatus = value),
                  ),
                  SizedBox(height: 4),
                  _buildCustomRadio(
                    label: AppStrings.failed,
                    value: isDeliveryTab ? "DELIVERY_FAILED" : "PICKUP_FAILED",
                    groupValue: selectedStatus,
                    onChanged: (value) =>
                        setState(() => selectedStatus = value),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  child: Text(
                    AppStrings.cancel,
                    style: TextStyle(
                      color: AppColors.black,
                      fontFamily: "Inter_regular",
                      fontSize: 14,
                    ),
                  ),
                  onPressed: () => Navigator.pop(context),
                ),
                TextButton(
                  child: Text(
                    AppStrings.confirm,
                    style: TextStyle(
                      fontFamily: "Inter_bold",
                      fontSize: 14,
                      color: AppColors.blue_0680F9,
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    if (selectedStatus != null) {
                      _confirmFinish(order, selectedStatus!);
                    }
                  },
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildCustomRadio({
    required String label,
    required String value,
    required String? groupValue,
    required ValueChanged<String?> onChanged,
  }) {
    final bool isSelected = value == groupValue;

    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.blue_0680F9.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.blue_0680F9 : AppColors.gray_DADFE7,
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 15,
              height: 15,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? AppColors.blue_0680F9
                      : AppColors.gray_DADFE7,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.blue_0680F9,
                        ),
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                color: AppColors.black,
                fontFamily: "Inter_semi_bold",
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmFinish(ShippingOrder order, String status) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(strokeWidth: 3, color: Colors.blue),
      ),
    );

    final success = await viewModel.completeOrder(
      widget.loginResponse,
      order,
      status,
    );

    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success ? AppStrings.update_successful : AppStrings.failure,
        ),
      ),
    );

    if (success) _fetchData();
  }

  @override
  void dispose() {
    viewModel.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: viewModel,
      builder: (context, _) {
        final displayDeliveryOrders = viewModel.ordersDelivery;
        final displayPickupOrders = viewModel.ordersPickup;

        return Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                Header(
                  loginResponse: widget.loginResponse,
                  totalIncome: viewModel.totalIncome,
                  totalOrders: viewModel.totalOrders,
                  isLoading:
                      viewModel.isLoadingOrdersDelivery ||
                      viewModel.isLoadingOrdersPickup,
                ),
                Expanded(
                  child: Container(
                    color: AppColors.gray_F7F7FC,
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: AppColors.white,
                        border: Border.all(
                          color: AppColors.gray_DADFE7,
                          width: 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              SvgPicture.asset(
                                "assets/images/ic_delivered.svg",
                                colorFilter: const ColorFilter.mode(
                                  AppColors.blue_127AE2,
                                  BlendMode.srcIn,
                                ),
                                width: 28,
                                height: 28,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                // AppStrings.order,
                                AppStrings.home,
                                style: const TextStyle(
                                  color: AppColors.blue_344256,
                                  fontFamily: "Inter_bold",
                                  fontSize: 23,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          TabBar(
                            controller: _tabController,
                            indicatorColor: AppColors.blue_127AE2,
                            labelColor: AppColors.blue_127AE2,
                            unselectedLabelColor: AppColors.black_50,
                            indicatorWeight: 3,
                            indicatorSize: TabBarIndicatorSize.tab,
                            tabs: [
                              Tab(
                                child: Text(
                                  AppStrings.delivery,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontFamily: "Inter_semi_bold",
                                  ),
                                ),
                              ),
                              Tab(
                                child: Text(
                                  AppStrings.receive,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontFamily: "Inter_semi_bold",
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Expanded(
                            child: TabBarView(
                              controller: _tabController,
                              children: [
                                _buildOrdersList(displayDeliveryOrders, true),
                                _buildOrdersList(displayPickupOrders, false),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildOrdersList(List<ShippingOrder> orders, bool isDeliveryTab) {
    return OrdersList(
      orders: orders,
      isLoading:
          viewModel.isLoadingOrdersDelivery || viewModel.isLoadingOrdersPickup,
      isDelivery: isDeliveryTab,
      onRefresh: _fetchData,
      onGuide: _onGuidePressed,
      onFinish: (order) => _onFinishPressed(order, isDeliveryTab),
    );
  }
}
