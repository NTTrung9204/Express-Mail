import 'dart:ffi';

import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/ui/detailorder/DetailOrderViewModel.dart';
import 'package:express_mail/ui/detailorder/components/DeliveryLocation.dart';
import 'package:express_mail/ui/detailorder/components/Header.dart';
import 'package:express_mail/ui/detailorder/components/IncomeDetail.dart';
import 'package:express_mail/ui/detailorder/components/PackageDetails.dart';
import 'package:express_mail/ui/detailorder/components/PickUpLocation.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:flutter_svg/flutter_svg.dart';

class DetailOrderActivity extends StatefulWidget {
  final DetailOrder detailOrder;

  const DetailOrderActivity({super.key, required this.detailOrder});

  @override
  State<DetailOrderActivity> createState() => _DetailOrderActivityState();
}

class _DetailOrderActivityState extends State<DetailOrderActivity>
    with SingleTickerProviderStateMixin {
  final ValueNotifier<double> distance = ValueNotifier<double>(0);
  final ValueNotifier<double> estimated = ValueNotifier<double>(0);
  final ValueNotifier<bool> loading = ValueNotifier<bool>(true);

  late TabController _tabController;
  late DetailOrderViewModel detailOrderViewModel;

  @override
  void initState() {
    super.initState();
    detailOrderViewModel = DetailOrderViewModel(
      detailOrder: widget.detailOrder,
      distance: distance,
      estimated: estimated,
      loading: loading,
    );
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white_F8F7FC,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Header(
              detailOrder: widget.detailOrder,
              distance: distance,
              estimated: estimated,
              loading: loading,
            ),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  children: [
                    PickUpLocation(detailOrder: widget.detailOrder),
                    DeliveryLocation(detailOrder: widget.detailOrder),
                    PackageDetails(detailOrder: widget.detailOrder),
                    IncomeDetail(detailOrder: widget.detailOrder),
                    Container(
                      margin: EdgeInsets.symmetric(horizontal: 18, vertical: 8),
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
                              backgroundColor: MaterialStateProperty.all(Colors.transparent),
                              overlayColor: MaterialStateProperty.resolveWith(
                                    (states) => states.contains(MaterialState.pressed)
                                    ? AppColors.gray_EDEFF3.withOpacity(0.1)
                                    : null,
                              ),
                              shape: MaterialStateProperty.all(
                                RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              shadowColor: MaterialStateProperty.all(Colors.transparent),
                              padding: MaterialStateProperty.all(EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
                            ),
                            onPressed: () {},
                            child: LayoutBuilder(
                              builder: (context, constraints) {
                                return Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    SvgPicture.asset(
                                      "assets/images/ic_delivered.svg",
                                      colorFilter: ColorFilter.mode(AppColors.white, BlendMode.srcIn),
                                      width: 13,
                                      height: 13,
                                    ),
                                    SizedBox(width: 8),
                                    ConstrainedBox(
                                      constraints: BoxConstraints(
                                        maxWidth: constraints.maxWidth - 30, // trừ icon + spacing
                                      ),
                                      child: Text(
                                        AppStrings.pick_up,
                                        style: TextStyle(
                                          fontFamily: "Inter_bold",
                                          fontSize: 13,
                                          color: AppColors.white,
                                        ),
                                        textAlign: TextAlign.center,
                                        softWrap: true,
                                      ),
                                    ),
                                  ],
                                );
                              },
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
      ),
    );
  }
}
