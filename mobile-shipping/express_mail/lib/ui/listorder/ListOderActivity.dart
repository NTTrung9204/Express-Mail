import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/ui/listorder/ListOrderViewModel.dart';
import 'package:express_mail/ui/listorder/PreviewMapBottomSheet.dart';
import 'package:express_mail/ui/listorder/components/OrderList.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class ListOrderActivity extends StatefulWidget {
  final LoginResponse loginResponse;
  final List<ShippingOrder> orders;
  final String geometry;
  final bool isDelivery;

  const ListOrderActivity({
    super.key,
    required this.loginResponse,
    required this.orders,
    required this.geometry,
    required this.isDelivery,
  });

  @override
  State<ListOrderActivity> createState() => _ListOrderActivityState();
}

class _ListOrderActivityState extends State<ListOrderActivity> {
  late final ListOrderViewModel viewModel;

  @override
  void initState() {
    super.initState();
    viewModel = ListOrderViewModel();
  }

  @override
  void dispose() {
    viewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white_F8F7FC,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                _buildHeader(),
                SizedBox(height: 12),
                Expanded(child: _buildListOrder()),
              ],
            ),
            AnimatedBuilder(
              animation: viewModel,
              builder: (context, _) {
                if (!viewModel.isCompletingOrder)
                  return const SizedBox.shrink();
                return Container(
                  color: Colors.black.withValues(alpha: 0.3),
                  alignment: Alignment.center,
                  child: const CircularProgressIndicator(
                    strokeWidth: 3,
                    color: AppColors.blue_127AE2,
                  ),
                );
              },
            ),
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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
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
                AppStrings.list_order,
                style: TextStyle(
                  fontFamily: "Inter_bold",
                  fontSize: 18,
                  color: AppColors.blue_344256,
                ),
              ),
            ],
          ),

          InkWell(
            onTap: _showPreviewMap,
            borderRadius: BorderRadius.circular(24),
            child: const Padding(
              padding: EdgeInsets.all(8.0),
              child: Icon(
                Icons.map_outlined,
                color: AppColors.blue_344256,
                size: 25,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListOrder() {
    return OrderList(
      loginResponse: widget.loginResponse,
      orders: widget.orders,
      onOrderFinished: (order, status) async {
        bool success = await viewModel.completeOrder(
          widget.loginResponse,
          order,
          status,
        );
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success ? AppStrings.update_successful : AppStrings.failure,
            ),
          ),
        );
        if (success) {
          setState(() {
            widget.orders.removeWhere((o) => o.id == order.id);
          });
        }
      },
      isDelivery: widget.isDelivery,
    );
  }

  void _showPreviewMap() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return PreviewMapBottomSheet(
          geometry: widget.geometry,
          orders: widget.orders,
          isDelivery: widget.isDelivery,
        );
      },
    );
  }
}
