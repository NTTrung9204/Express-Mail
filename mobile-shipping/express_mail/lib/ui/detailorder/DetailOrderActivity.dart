import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/ui/detailorder/DetailOrderViewModel.dart';
import 'package:express_mail/ui/detailorder/components/DeliveryLocation.dart';
import 'package:express_mail/ui/detailorder/components/Header.dart';
import 'package:express_mail/ui/detailorder/components/IncomeDetail.dart';
import 'package:express_mail/ui/detailorder/components/PackageDetails.dart';
import 'package:express_mail/ui/detailorder/components/PickUpLocation.dart';
import 'package:express_mail/ui/detailorder/components/ShopLocation.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'dart:async';

import 'package:geolocator/geolocator.dart';

class DetailOrderActivity extends StatefulWidget {
  final LoginResponse loginResponse;
  final ShippingOrder detailOrder;
  final bool isDelivery;
  final Function(String status)? onFinish;

  const DetailOrderActivity({
    super.key,
    required this.loginResponse,
    required this.detailOrder,
    required this.isDelivery,
    this.onFinish,
  });

  @override
  State<DetailOrderActivity> createState() => _DetailOrderActivityState();
}

class _DetailOrderActivityState extends State<DetailOrderActivity> {
  late DetailOrderViewModel viewModel;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    viewModel = DetailOrderViewModel(detailOrder: widget.detailOrder, isDelivery: widget.isDelivery);
    _requestLocationPermissionAndInit();
  }

  Future<void> _requestLocationPermissionAndInit() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      _showErrorSnack(AppStrings.please_enable_location_access_on_your_device);
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _showErrorSnack(AppStrings.location_access_denied);
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      _showErrorSnack(AppStrings.location_access_denied);
      return;
    }
    _timer = Timer.periodic(const Duration(seconds: 20), (_) {
      viewModel.updateDistanceAndTime();
    });
    viewModel.startLocationStream(milliseconds: 5000);

    setState(() {});
  }

  void _showErrorSnack(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  void dispose() {
    _timer?.cancel();
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
                Header(viewModel: viewModel),
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      children: [
                        if (widget.isDelivery) ...[
                          ShopLocation(detailOrder: widget.detailOrder),
                          DeliveryLocation(detailOrder: widget.detailOrder),
                        ] else
                          PickUpLocation(detailOrder: widget.detailOrder),
                        PackageDetails(detailOrder: widget.detailOrder),
                        IncomeDetail(detailOrder: widget.detailOrder),
                        Container(
                          margin: EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 8,
                          ),
                          child: SizedBox(
                            width: double.infinity,
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    AppColors.blue_127AE2,
                                    AppColors.blue_5AA6F2,
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: TextButton(
                                style: ButtonStyle(
                                  backgroundColor: WidgetStateProperty.all(
                                    Colors.transparent,
                                  ),
                                  overlayColor: WidgetStateProperty.resolveWith(
                                    (states) =>
                                        states.contains(WidgetState.pressed)
                                        ? AppColors.gray_EDEFF3.withValues(
                                            alpha: 0.1,
                                          )
                                        : null,
                                  ),
                                  shape: WidgetStateProperty.all(
                                    RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  shadowColor: WidgetStateProperty.all(
                                    Colors.transparent,
                                  ),
                                  padding: WidgetStateProperty.all(
                                    EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 12,
                                    ),
                                  ),
                                ),
                                onPressed: () {
                                  _showFinishDialog(context);
                                },
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    SvgPicture.asset(
                                      "assets/images/ic_delivered.svg",
                                      colorFilter: ColorFilter.mode(
                                        AppColors.white,
                                        BlendMode.srcIn,
                                      ),
                                      width: 13,
                                      height: 13,
                                    ),
                                    SizedBox(width: 8),
                                    Text(
                                      (!widget.isDelivery)
                                          ? AppStrings.pick_up
                                          : AppStrings.delivery,
                                      style: TextStyle(
                                        fontFamily: "Inter_bold",
                                        fontSize: 13,
                                        color: AppColors.white,
                                      ),
                                      textAlign: TextAlign.center,
                                      softWrap: true,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
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

  void _showFinishDialog(BuildContext context) {
    String selectedStatus = ShippingStatus.FINISHED.key;

    showDialog(
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
                style: TextStyle(fontFamily: "Inter_bold", fontSize: 18),
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
                  const SizedBox(height: 4),
                  _buildCustomRadio(
                    label: AppStrings.failed,
                    value: ShippingStatus.FAILED.key,
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
                  onPressed: () =>
                      Navigator.of(context, rootNavigator: true).pop(),
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
                    Navigator.of(context, rootNavigator: true).pop();
                    final String finalStatus =
                        selectedStatus == ShippingStatus.FINISHED.key
                        ? ShippingStatus.FINISHED.key
                        : (widget.isDelivery
                              ? 'DELIVERY_FAILED'
                              : 'PICKUP_FAILED');
                    if (widget.onFinish != null) {
                      widget.onFinish!(finalStatus);
                    }
                    Navigator.pop(context);
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
    required String groupValue,
    required ValueChanged<String> onChanged,
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
                  ? const Center(
                      child: SizedBox(
                        width: 8,
                        height: 8,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.blue_0680F9,
                          ),
                        ),
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: const TextStyle(
                fontFamily: "Inter_semi_bold",
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
