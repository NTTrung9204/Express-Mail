import 'package:flutter/material.dart';
import 'package:express_mail/ui/home/fragment/order/components/OrderList.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'OrderViewModel.dart';

class OrderFragment extends StatefulWidget {
  const OrderFragment({super.key});

  @override
  State<OrderFragment> createState() => _OrderFragmentState();
}

class _OrderFragmentState extends State<OrderFragment>
    with SingleTickerProviderStateMixin {
  late final OrderViewModel viewModel;

  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    viewModel = OrderViewModel();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
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
            ValueListenableBuilder3<int, int, int>(
              first: viewModel.availableCount,
              second: viewModel.deliveringCount,
              third: viewModel.finishCount,
              builder: (context, avail, deliver, finish, _) {
                return _buildTabBar(avail, deliver, finish);
              },
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  OrderList(detailOrderNotifier: viewModel.availableOrders, loading: viewModel.loading),
                  OrderList(detailOrderNotifier: viewModel.deliveringOrders, loading: viewModel.loading),
                  OrderList(detailOrderNotifier: viewModel.finishedOrders, loading: viewModel.loading),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() => Container(
    padding: const EdgeInsets.all(16),
    width: double.infinity,
    decoration: const BoxDecoration(
      color: AppColors.white,
      border:
      Border(bottom: BorderSide(color: AppColors.gray_DADFE7, width: 1)),
    ),
    child: const Column(
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
  );

  Widget _buildTabBar(int avail, int deliver, int finish) => Container(
    margin: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.white_EDEFF3,
      borderRadius: BorderRadius.circular(10),
    ),
    child: TabBar(
      controller: _tabController,
      isScrollable: true,
      indicatorColor: AppColors.blue_127AE2,
      labelColor: AppColors.blue_344256,
      unselectedLabelColor: AppColors.gray_7B899D,
      dividerColor: AppColors.transparent,
      tabAlignment: TabAlignment.center,
      indicatorSize: TabBarIndicatorSize.tab,
      tabs: [
        Tab(text: "${AppStrings.available} ($avail)"),
        Tab(text: "${AppStrings.delivering} ($deliver)"),
        Tab(text: "${AppStrings.finish} ($finish)"),
      ],
    ),
  );
}

/// Custom ValueListenableBuilder cho 3 ValueNotifier
class ValueListenableBuilder3<A, B, C> extends StatelessWidget {
  final ValueNotifier<A> first;
  final ValueNotifier<B> second;
  final ValueNotifier<C> third;
  final Widget Function(BuildContext, A, B, C, Widget?) builder;

  const ValueListenableBuilder3({
    super.key,
    required this.first,
    required this.second,
    required this.third,
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<A>(
      valueListenable: first,
      builder: (context, valueA, _) {
        return ValueListenableBuilder<B>(
          valueListenable: second,
          builder: (context, valueB, _) {
            return ValueListenableBuilder<C>(
              valueListenable: third,
              builder: (context, valueC, child) {
                return builder(context, valueA, valueB, valueC, child);
              },
            );
          },
        );
      },
    );
  }
}
