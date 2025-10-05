import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class PackageDetails extends StatelessWidget {
  final DetailOrder detailOrder;

  const PackageDetails({super.key, required this.detailOrder});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: EdgeInsets.symmetric(horizontal: 18, vertical: 8),
      padding: EdgeInsets.all(25),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: BoxBorder.all(color: AppColors.gray_DADFE7, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray_DADFE7,
            blurRadius: 2,
            offset: Offset(0, 2),
          ),
        ],
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
                width: 23,
                height: 23,
              ),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  AppStrings.package_details,
                  style: TextStyle(
                    color: AppColors.blue_344256,
                    fontFamily: "Inter_bold",
                    fontSize: 23,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Row(
            children: [
              SvgPicture.asset(
                "assets/images/ic_length.svg",
                colorFilter: ColorFilter.mode(
                  AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
                width: 13,
                height: 13,
              ),
              SizedBox(width: 5),
              Expanded(
                child: Text(
                  "${AppStrings.length}: ${detailOrder.order.length} ${AppStrings.cm}",
                  style: TextStyle(
                    fontSize: 13,
                    fontFamily: "Inter_regular",
                    color: AppColors.gray_7B899D,
                  ),
                  softWrap: true,
                  overflow: TextOverflow.visible,
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          Row(
            children: [
              SvgPicture.asset(
                "assets/images/ic_width.svg",
                colorFilter: ColorFilter.mode(
                  AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
                width: 13,
                height: 13,
              ),
              SizedBox(width: 5),
              Expanded(
                child: Text(
                  "${AppStrings.width}: ${detailOrder.order.width} ${AppStrings.cm}",
                  style: TextStyle(
                    fontSize: 13,
                    fontFamily: "Inter_regular",
                    color: AppColors.gray_7B899D,
                  ),
                  softWrap: true,
                  overflow: TextOverflow.visible,
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          Row(
            children: [
              SvgPicture.asset(
                "assets/images/ic_height.svg",
                colorFilter: ColorFilter.mode(
                  AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
                width: 13,
                height: 13,
              ),
              SizedBox(width: 5),
              Expanded(
                child: Text(
                  "${AppStrings.height}: ${detailOrder.order.height} ${AppStrings.cm}",
                  style: TextStyle(
                    fontSize: 13,
                    fontFamily: "Inter_regular",
                    color: AppColors.gray_7B899D,
                  ),
                  softWrap: true,
                  overflow: TextOverflow.visible,
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          Row(
            children: [
              SvgPicture.asset(
                "assets/images/ic_weight.svg",
                colorFilter: ColorFilter.mode(
                  AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
                width: 13,
                height: 13,
              ),
              SizedBox(width: 5),
              Expanded(
                child: Text(
                  "${AppStrings.weight}: ${detailOrder.order.weight} ${AppStrings.kg}",
                  style: TextStyle(
                    fontSize: 13,
                    fontFamily: "Inter_regular",
                    color: AppColors.gray_7B899D,
                  ),
                  softWrap: true,
                  overflow: TextOverflow.visible,
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  SvgPicture.asset(
                    "assets/images/ic_product.svg",
                    colorFilter: ColorFilter.mode(
                      AppColors.gray_7B899D,
                      BlendMode.srcIn,
                    ),
                    width: 13,
                    height: 13,
                  ),
                  SizedBox(width: 5),
                  Text(
                    "${AppStrings.products} (${detailOrder.products.length}):",
                    style: TextStyle(
                      fontSize: 13,
                      fontFamily: "Inter_regular",
                      color: AppColors.gray_7B899D,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 5),
              Container(
                margin: EdgeInsetsDirectional.symmetric(
                  vertical: 0,
                  horizontal: 18,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: detailOrder.products.map((product) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              SvgPicture.asset(
                                "assets/images/ic_tick.svg",
                                colorFilter: ColorFilter.mode(
                                  AppColors.green_22C35D,
                                  BlendMode.srcIn,
                                ),
                                width: 13,
                                height: 13,
                              ),
                              SizedBox(width: 5),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    product.name,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontFamily: "Inter_regular",
                                      color: AppColors.gray_7B899D,
                                    ),
                                  ),
                                  Text(
                                    "${AppStrings.weight}: ${product.weight} ${AppStrings.kg}",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontFamily: "Inter_regular",
                                      color: AppColors.gray_7B899D,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: () {
                              if (product.imgUrl.isNotEmpty) {
                                showDialog(
                                  context: context,
                                  builder: (_) => Dialog(
                                    backgroundColor: Colors.transparent,
                                    child: InteractiveViewer(
                                      child: Image.network(
                                        product.imgUrl,
                                        fit: BoxFit.contain,
                                      ),
                                    ),
                                  ),
                                );
                              }
                            },
                            child: SvgPicture.asset(
                              "assets/images/ic_picture.svg",
                              width: 30,
                              height: 30,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
