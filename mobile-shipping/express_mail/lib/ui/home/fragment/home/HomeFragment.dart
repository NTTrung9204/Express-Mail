import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/Order.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/ui/home/fragment/home/HomeFragmentViewModel.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:lottie/lottie.dart';

class HomeFragment extends StatefulWidget {
  final LoginResponse loginResponse;

  const HomeFragment({super.key, required this.loginResponse});

  @override
  State<HomeFragment> createState() => _HomeFragmentState();
}

class _HomeFragmentState extends State<HomeFragment> {
  late final HomeFragmentViewModel viewModel;

  // Header ValueNotifiers
  late final ValueNotifier<String> name = ValueNotifier<String>(
    widget.loginResponse.user.fullName,
  );

  // final ValueNotifier<String> textEarned = ValueNotifier<String>("127.000 đ");
  // final ValueNotifier<String> textDelivered = ValueNotifier<String>("8");
  // final ValueNotifier<String> textOnline = ValueNotifier<String>("6.5h");
  // final ValueNotifier<String> textEvaluate = ValueNotifier<String>("4.5");
  final ValueNotifier<bool> loading = ValueNotifier<bool>(true);

  // Orders list
  final ValueNotifier<List<Order>> orders = ValueNotifier([]);

  @override
  void initState() {
    super.initState();
    viewModel = HomeFragmentViewModel();
    fetchOrders();
  }

  void fetchOrders() async {
    loading.value = true;

    final result = await viewModel.getListOrder(widget.loginResponse);

    if (result != null) {
      orders.value = result.map((detailOrder) => detailOrder.order).toList();
    } else {
      debugPrint("Error: ${viewModel.errorMessage}");
    }

    loading.value = false;
  }

  @override
  void dispose() {
    // Dispose all ValueNotifiers
    name.dispose();
    // textEarned.dispose();
    // textDelivered.dispose();
    // textOnline.dispose();
    // textEvaluate.dispose();
    orders.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // HEADER
            ValueListenableBuilder<String>(
              valueListenable: name,
              builder: (context, valueName, _) {
                return Container(
                  padding: const EdgeInsets.all(16),
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.blue_127AE2, AppColors.blue_5AA6F2],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "${AppStrings.hello} $valueName!",
                        style: const TextStyle(
                          fontFamily: "Inter_bold",
                          fontSize: 19,
                          color: AppColors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        AppStrings.ready_to_start_shipping,
                        style: const TextStyle(
                          fontFamily: "Inter_regular",
                          fontSize: 15,
                          color: AppColors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Row(
                      //   children: [
                      //     Expanded(
                      //       child: buildColumn(
                      //         "assets/images/ic_earning.svg",
                      //         textEarned,
                      //         AppStrings.earned,
                      //       ),
                      //     ),
                      //     Expanded(
                      //       child: buildColumn(
                      //         "assets/images/ic_delivered.svg",
                      //         textDelivered,
                      //         AppStrings.delivered,
                      //       ),
                      //     ),
                      //   ],
                      // ),
                    ],
                  ),
                );
              },
            ),
            // ORDERS LIST
            Expanded(
              child: Container(
                color: AppColors.gray_F7F7FC,
                padding: const EdgeInsets.all(16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: AppColors.white,
                    border: Border.all(color: AppColors.gray_DADFE7, width: 1),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
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
                            AppStrings.order,
                            style: const TextStyle(
                              color: AppColors.blue_344256,
                              fontFamily: "Inter_bold",
                              fontSize: 23,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Expanded(
                        child: ValueListenableBuilder2<List<Order>, bool>(
                          first: orders,
                          second: loading,
                          builder: (context, orderList, isLoading, _) {
                            if (isLoading) {
                              return Center(
                                key: const ValueKey("loading"),
                                child: Lottie.asset(
                                  "assets/animation/ani_loading_order.json",
                                  fit: BoxFit.contain,
                                  repeat: true,
                                ),
                              );
                            } else {
                              if (orderList.isEmpty) {
                                return Center(
                                  key: const ValueKey("empty"),
                                  child: Lottie.asset(
                                    "assets/animation/ani_empty.json",
                                    fit: BoxFit.contain,
                                    repeat: true,
                                  ),
                                );
                              } else {
                                return ListView.builder(
                                  key: const ValueKey("done"),
                                  itemCount: orderList.length,
                                  itemBuilder: (context, index) {
                                    return buildOrderItem(orderList[index]);
                                  },
                                );
                              }
                            }
                          },
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
  }

  // HEADER COLUMN ITEM
  Widget buildColumn(String ic, ValueNotifier<String> myText, String title) {
    return Column(
      children: [
        SvgPicture.asset(
          ic,
          colorFilter: const ColorFilter.mode(AppColors.white, BlendMode.srcIn),
          width: 28,
          height: 28,
        ),
        const SizedBox(height: 9),
        ValueListenableBuilder<String>(
          valueListenable: myText,
          builder: (context, value, child) {
            return Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 17,
                fontFamily: "Inter_bold",
                color: AppColors.white,
              ),
            );
          },
        ),
        const SizedBox(height: 5),
        Text(
          title,
          style: const TextStyle(
            color: AppColors.white_80,
            fontSize: 11,
            fontFamily: "Inter_regular",
          ),
        ),
      ],
    );
  }

  // ORDER ITEM
  Widget buildOrderItem(Order order) {
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
          // Mã đơn + trạng thái
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                order.code,
                style: const TextStyle(
                  fontFamily: "Inter_bold",
                  fontSize: 13,
                  color: AppColors.blue_344256,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: order.shippingStatus.color,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  order.shippingStatus.name,
                  style: const TextStyle(fontSize: 12, color: AppColors.white),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Địa chỉ & số điện thoại
          Row(
            children: [
              SvgPicture.asset(
                "assets/images/ic_address.svg",
                colorFilter: const ColorFilter.mode(
                  AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
                width: 13,
                height: 13,
              ),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  "${order.shippingStatus == ShippingStatus.SHIPPING ? AppStrings.delivery : AppStrings.get_goods}: "
                  "${order.receiverAddress}, ${order.receiverWardCommune}, ${order.receiverProvinceCity}",
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
                colorFilter: const ColorFilter.mode(
                  AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
                width: 13,
                height: 13,
              ),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  "${AppStrings.phone_number}: ${order.receiverPhone}",
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.gray_7B899D,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // COD + phí ship
          Row(
            children: [
              Expanded(
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    "${AppStrings.total_amount}: ${NumberFormat.decimalPattern('vi').format(order.cod + order.shippingCost)}đ",
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.green_22C35D,
                      fontFamily: "Inter_bold",
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),

          // Nút Guide & Finish
          Row(
            children: [
              Expanded(
                child: Container(
                  margin: const EdgeInsets.only(right: 6),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.blue_127AE2, AppColors.blue_5AA6F2],
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextButton(
                    style: TextButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(
                        vertical: 11,
                        horizontal: 4,
                      ),
                    ),
                    onPressed: () {},
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          "assets/images/ic_guide.svg",
                          colorFilter: const ColorFilter.mode(
                            AppColors.white,
                            BlendMode.srcIn,
                          ),
                          width: 13,
                          height: 13,
                        ),
                        const SizedBox(width: 12),
                        Flexible(
                          child: Text(
                            AppStrings.guide,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: "Inter_regular",
                              fontSize: 13,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  margin: const EdgeInsets.only(left: 6),
                  decoration: BoxDecoration(
                    color: AppColors.white_F8F7FC,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.white_EDEFF3, width: 1),
                  ),
                  child: TextButton(
                    style: TextButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(
                        vertical: 11,
                        horizontal: 4,
                      ),
                    ),
                    onPressed: () {},
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          "assets/images/ic_finish.svg",
                          colorFilter: const ColorFilter.mode(
                            AppColors.blue_344256,
                            BlendMode.srcIn,
                          ),
                          width: 13,
                          height: 13,
                        ),
                        const SizedBox(width: 12),
                        Flexible(
                          child: Text(
                            AppStrings.finish,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: "Inter_regular",
                              fontSize: 13,
                              color: AppColors.blue_344256,
                            ),
                          ),
                        ),
                      ],
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
}

/// Custom ValueListenableBuilder cho 2 ValueNotifier
class ValueListenableBuilder2<A, B> extends StatelessWidget {
  final ValueNotifier<A> first;
  final ValueNotifier<B> second;
  final Widget Function(BuildContext, A, B, Widget?) builder;

  const ValueListenableBuilder2({
    super.key,
    required this.first,
    required this.second,
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<A>(
      valueListenable: first,
      builder: (context, valueA, _) {
        return ValueListenableBuilder<B>(
          valueListenable: second,
          builder: (context, valueB, child) {
            return builder(context, valueA, valueB, child);
          },
        );
      },
    );
  }
}
