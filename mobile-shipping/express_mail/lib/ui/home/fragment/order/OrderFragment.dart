import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:flutter/material.dart';
import 'package:marquee/marquee.dart';
import 'OrderViewModel.dart';
import 'components/OrderList.dart';
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

  int currentPageAll = 1;
  int currentPagePickup = 1;
  int currentPageShipping = 1;
  int currentPageReturning = 1;

  @override
  void initState() {
    super.initState();
    viewModel = OrderViewModel();
    _tabController = TabController(length: 4, vsync: this);

    viewModel.fetchPickupRequestOrders(widget.loginResponse);
    viewModel.fetchShippingOrders(widget.loginResponse);
    viewModel.fetchReturningOrders(widget.loginResponse);
    viewModel.fetchAllOrders(widget.loginResponse);

    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {});
      }
    });
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
            _buildTabBar(),
            Expanded(
              child: Column(
                children: [
                  Expanded(child: _buildTabBarView()),
                  AnimatedBuilder(
                    animation: viewModel,
                    builder: (context, _) => _buildPaginationBar(),
                  ),
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
      border: Border(
        bottom: BorderSide(color: AppColors.gray_DADFE7, width: 1),
      ),
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

  Widget _buildTabBar() {
    return AnimatedBuilder(
      animation: viewModel,
      builder: (context, _) {
        return Container(
          margin: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.white_EDEFF3,
            borderRadius: BorderRadius.circular(10),
          ),
          child: TabBar(
            controller: _tabController,
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            indicatorColor: AppColors.blue_127AE2,
            labelColor: AppColors.blue_344256,
            unselectedLabelColor: AppColors.gray_7B899D,
            indicatorSize: TabBarIndicatorSize.tab,
            labelPadding: EdgeInsets.zero,
            tabs: [
              _buildTab("${AppStrings.all} (${viewModel.allCount})"),
              _buildTab(
                "${AppStrings.pickup_requested} (${viewModel.pickupRequestCount})",
              ),
              _buildTab("${AppStrings.shipping} (${viewModel.shippingCount})"),
              _buildTab(
                "${AppStrings.returning} (${viewModel.returningCount})",
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTab(String text) {
    return Tab(
      child: Align(
        alignment: Alignment.centerLeft,
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

  Widget _buildTabBarView() {
    return AnimatedBuilder(
      animation: viewModel,
      builder: (context, _) {
        return TabBarView(
          controller: _tabController,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            RefreshIndicator(
              onRefresh: () async => _fetchPageForCurrentTab(page: currentPageAll),
              child: OrderList(
                orders: viewModel.allOrders,
                isLoading: viewModel.isLoadingAll,
              ),
            ),
            RefreshIndicator(
              onRefresh: () async => _fetchPageForCurrentTab(page: currentPagePickup),
              child: OrderList(
                orders: viewModel.pickupRequestOrders,
                isLoading: viewModel.isLoadingPickupRequest,
              ),
            ),
            RefreshIndicator(
              onRefresh: () async => _fetchPageForCurrentTab(page: currentPageShipping),
              child: OrderList(
                orders: viewModel.shippingOrders,
                isLoading: viewModel.isLoadingShipping,
              ),
            ),
            RefreshIndicator(
              onRefresh: () async => _fetchPageForCurrentTab(page: currentPageReturning),
              child: OrderList(
                orders: viewModel.returningOrders,
                isLoading: viewModel.isLoadingReturning,
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildPaginationBar() {
    int currentPage;
    int totalPages;

    switch (_tabController.index) {
      case 0:
        currentPage = currentPageAll;
        totalPages = viewModel.allTotalPages;
        break;
      case 1:
        currentPage = currentPagePickup;
        totalPages = viewModel.pickupTotalPages;
        break;
      case 2:
        currentPage = currentPageShipping;
        totalPages = viewModel.shippingTotalPages;
        break;
      case 3:
        currentPage = currentPageReturning;
        totalPages = viewModel.returningTotalPages;
        break;
      default:
        currentPage = 1;
        totalPages = 1;
    }

    if (totalPages <= 1) return const SizedBox.shrink();

    final screenWidth = MediaQuery.of(context).size.width;

    const iconWidth = 30.0; // <<, <, >, >>
    final availableWidth = screenWidth - iconWidth * 4;

    const pageButtonWidth = 30.0;
    final maxPageButtons = availableWidth ~/ pageButtonWidth;

    final visiblePageCount = maxPageButtons.clamp(3, 7);

    int startPage = currentPage - visiblePageCount ~/ 2;
    int endPage = startPage + visiblePageCount - 1;

    if (startPage < 1) {
      endPage += 1 - startPage;
      startPage = 1;
    }
    if (endPage > totalPages) {
      startPage -= endPage - totalPages;
      endPage = totalPages;
    }
    if (startPage < 1) startPage = 1;

    List<Widget> buttons = [];

    // <<, <
    buttons.addAll([
      IconButton(
        icon: const Icon(Icons.first_page, size: 20),
        color: currentPage > 1 ? Colors.black : Colors.grey,
        onPressed: currentPage > 1 ? () => _onPageButtonPressed(1) : null,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 0, minHeight: 0),
      ),
      IconButton(
        icon: const Icon(Icons.chevron_left, size: 20),
        color: currentPage > 1 ? Colors.black : Colors.grey,
        onPressed: currentPage > 1
            ? () => _onPageButtonPressed(currentPage - 1)
            : null,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 0, minHeight: 0),
      ),
    ]);

    for (int i = startPage; i <= endPage; i++) {
      bool isCurrent = i == currentPage;
      buttons.add(
        SizedBox(
          width: pageButtonWidth,
          child: TextButton(
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(0, 0),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: isCurrent ? null : () => _onPageButtonPressed(i),
            child: Text(
              '$i',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                fontSize: 14,
                color: isCurrent ? Colors.blue : Colors.black,
              ),
            ),
          ),
        ),
      );
    }

    // >, >>
    buttons.addAll([
      IconButton(
        icon: const Icon(Icons.chevron_right, size: 20),
        color: currentPage < totalPages ? Colors.black : Colors.grey,
        onPressed: currentPage < totalPages
            ? () => _onPageButtonPressed(currentPage + 1)
            : null,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 0, minHeight: 0),
      ),
      IconButton(
        icon: const Icon(Icons.last_page, size: 20),
        color: currentPage < totalPages ? Colors.black : Colors.grey,
        onPressed: currentPage < totalPages
            ? () => _onPageButtonPressed(totalPages)
            : null,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(minWidth: 0, minHeight: 0),
      ),
    ]);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Container(
        width: double.infinity,
        margin: EdgeInsetsGeometry.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: buttons,
        ),
      ),
    );
  }

  void _onPageButtonPressed(int page) {
    switch (_tabController.index) {
      case 0:
        currentPageAll = page;
        break;
      case 1:
        currentPagePickup = page;
        break;
      case 2:
        currentPageShipping = page;
        break;
      case 3:
        currentPageReturning = page;
        break;
    }
    _fetchPageForCurrentTab(page: page);
    setState(() {});
  }

  void _fetchPageForCurrentTab({int? page}) {
    switch (_tabController.index) {
      case 0:
        currentPageAll = page ?? currentPageAll;
        viewModel.fetchAllOrders(widget.loginResponse, page: currentPageAll);
        break;
      case 1:
        currentPagePickup = page ?? currentPagePickup;
        viewModel.fetchPickupRequestOrders(
          widget.loginResponse,
          page: currentPagePickup,
        );
        break;
      case 2:
        currentPageShipping = page ?? currentPageShipping;
        viewModel.fetchShippingOrders(
          widget.loginResponse,
          page: currentPageShipping,
        );
        break;
      case 3:
        currentPageReturning = page ?? currentPageReturning;
        viewModel.fetchReturningOrders(
          widget.loginResponse,
          page: currentPageReturning,
        );
        break;
    }
  }
}
