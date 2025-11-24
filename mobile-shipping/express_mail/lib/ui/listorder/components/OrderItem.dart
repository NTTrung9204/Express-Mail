import 'package:express_mail/ui/detailorder/DetailOrderActivity.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/data/model/LoginResponse.dart';

class OrderItem extends StatelessWidget {
  final LoginResponse? loginResponse;
  final ShippingOrder? detailOrder;
  final bool isShimmer;
  final bool isDelivery;
  final Function(String status)? onFinish;

  const OrderItem({
    super.key,
    this.loginResponse,
    this.detailOrder,
    this.onFinish,
    this.isShimmer = false,
    required this.isDelivery,
  });

  @override
  Widget build(BuildContext context) {
    if (detailOrder == null) return const SizedBox();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray_DADFE7, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray_DADFE7,
            blurRadius: 2,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Code + Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                detailOrder!.code,
                style: const TextStyle(
                  fontFamily: "Inter_bold",
                  fontSize: 13,
                  color: AppColors.blue_344256,
                ),
              ),
              // Container(
              //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              //   decoration: BoxDecoration(
              //     color: detailOrder!.shippingStatus.color,
              //     borderRadius: BorderRadius.circular(9999),
              //   ),
              //   child: Text(
              //     detailOrder!.shippingStatus.name,
              //     style: const TextStyle(fontSize: 12, color: AppColors.white),
              //   ),
              // ),
            ],
          ),
          const SizedBox(height: 10),
          _buildAddressInfo(),
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              "${AppStrings.total_amount}: ${NumberFormat.decimalPattern('vi').format(detailOrder!.cod + detailOrder!.shippingCost)}đ",
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.green_22C35D,
                fontFamily: "Inter_bold",
              ),
            ),
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              Expanded(
                child: TextButton(
                  style: TextButton.styleFrom(
                    backgroundColor: AppColors.gray_EDEFF3,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 11),
                  ),
                  onPressed: () {
                    if (loginResponse != null) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => DetailOrderActivity(
                            loginResponse: loginResponse!,
                            detailOrder: detailOrder!,
                            isDelivery: isDelivery,
                            onFinish: (status) {
                              if (onFinish != null) {
                                onFinish?.call(status);
                              }
                            },
                          ),
                        ),
                      );
                    }
                  },
                  child: const Text(
                    AppStrings.see_details,
                    style: TextStyle(
                      fontFamily: "Inter_regular",
                      fontSize: 13,
                      color: AppColors.blue_344256,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: TextButton(
                  style: TextButton.styleFrom(
                    backgroundColor: (isDelivery)
                        ? AppColors.green_22C35D
                        : AppColors.orange_FA832E,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 11),
                  ),
                  onPressed: () => _showFinishDialog(context),
                  child: Text(
                    (isDelivery)
                        ? AppStrings.delivery
                        : AppStrings.receive_application,
                    style: const TextStyle(
                      fontFamily: "Inter_regular",
                      fontSize: 13,
                      color: AppColors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
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

                    String finalStatus;
                    if (selectedStatus == ShippingStatus.FINISHED.key) {
                      finalStatus = ShippingStatus.FINISHED.key;
                    } else {
                      finalStatus = isDelivery
                          ? 'DELIVERY_FAILED'
                          : 'PICKUP_FAILED';
                    }
                    onFinish?.call(finalStatus);
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

  Widget _buildAddressInfo() {
    final isShipping = isDelivery;
    final title = isShipping ? AppStrings.delivery : AppStrings.get_goods;
    var address =
        "${detailOrder!.receiverAddress}, ${detailOrder!.receiverWardCommune}, ${detailOrder!.receiverProvinceCity}";
    if (!isDelivery) address = "${detailOrder!.shopProfile.address}";
    var phone = detailOrder!.receiverPhone;
    if (!isDelivery) phone = detailOrder!.shopProfile.phoneNumber;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            SvgPicture.asset(
              "assets/images/ic_address.svg",
              width: 13,
              height: 13,
              colorFilter: const ColorFilter.mode(
                AppColors.gray_7B899D,
                BlendMode.srcIn,
              ),
            ),
            const SizedBox(width: 5),
            Expanded(
              child: Text(
                "$title: $address",
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.gray_7B899D,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            SvgPicture.asset(
              "assets/images/ic_phone.svg",
              width: 13,
              height: 13,
              colorFilter: const ColorFilter.mode(
                AppColors.gray_7B899D,
                BlendMode.srcIn,
              ),
            ),
            const SizedBox(width: 5),
            Text(
              "${AppStrings.phone_number}: $phone",
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.gray_7B899D,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
