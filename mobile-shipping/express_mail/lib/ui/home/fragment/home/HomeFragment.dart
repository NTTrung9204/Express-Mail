import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/ui/home/fragment/home/components/Header.dart';
import 'package:express_mail/ui/home/fragment/home/components/OrdersList.dart';
import 'package:express_mail/ui/map/MapActivity.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/ui/home/fragment/home/HomeFragmentViewModel.dart';
import 'package:express_mail/data/model/DetailOrder.dart';

class HomeFragment extends StatefulWidget {
  final LoginResponse loginResponse;

  const HomeFragment({super.key, required this.loginResponse});

  @override
  State<HomeFragment> createState() => _HomeFragmentState();
}

class _HomeFragmentState extends State<HomeFragment> {
  late final HomeFragmentViewModel viewModel;

  @override
  void initState() {
    super.initState();
    viewModel = HomeFragmentViewModel();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      await Future.wait([
        viewModel.getListOrder(widget.loginResponse),
        viewModel.fetchFinishedOrdersToday(widget.loginResponse),
      ]);
    } catch (e) {
      debugPrint("Fetch data error: $e");
    }
  }

  void _onGuidePressed(DetailOrder order) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => MapActivity(order: order)),
    );
  }

  void _onFinishPressed(DetailOrder order) async {
    final viewModel = this.viewModel;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(
          strokeWidth: 3,
          color: AppColors.blue_127AE2,
        ),
      ),
    );

    final success = await viewModel.completeOrder(widget.loginResponse, order);

    Navigator.pop(context);

    if (success) {
      await _fetchData();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            AppStrings.order_completed_successfully,
            style: TextStyle(
              fontFamily: "Inter_regular",
              fontSize: 14,
              color: Colors.white,
            ),
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            AppStrings.order_completion_failed,
            style: TextStyle(
              fontFamily: "Inter_regular",
              fontSize: 14,
              color: Colors.white,
            ),
          ),
        ),
      );
    }
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
        final displayOrders = viewModel.orders.length > 5
            ? viewModel.orders.sublist(0, 5)
            : viewModel.orders;

        return Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                Header(
                  loginResponse: widget.loginResponse,
                  totalIncome: viewModel.totalIncome,
                  totalOrders: viewModel.totalOrders,
                  isLoading: viewModel.isLoadingFinishedOrders,
                ),
                Expanded(
                  child: OrdersList(
                    orders: displayOrders,
                    isLoading: viewModel.isLoadingOrders,
                    onRefresh: _fetchData,
                    onGuide: _onGuidePressed,
                    onFinish: _onFinishPressed,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
