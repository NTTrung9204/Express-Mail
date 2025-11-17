import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:url_launcher/url_launcher.dart';

class ShopLocation extends StatelessWidget {
  final ShippingOrder detailOrder;

  const ShopLocation({super.key, required this.detailOrder});

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
                "assets/images/ic_address.svg",
                colorFilter: const ColorFilter.mode(
                  AppColors.yellow_F8C630,
                  BlendMode.srcIn,
                ),
                width: 23,
                height: 23,
              ),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  AppStrings.shop_location,
                  style: TextStyle(
                    color: AppColors.yellow_F8C630,
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
                "assets/images/ic_address.svg",
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
                  "${AppStrings.address}: ${detailOrder.shopProfile.address}",
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
                "assets/images/ic_phone.svg",
                colorFilter: ColorFilter.mode(
                  AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
                fit: BoxFit.contain,
                width: 13,
                height: 13,
              ),
              SizedBox(width: 5),
              Expanded(
                child: Text(
                  "${AppStrings.phone_number}: ${detailOrder.shopProfile.phoneNumber}",
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.gray_7B899D,
                    fontFamily: "Inter_regular",
                  ),
                  softWrap: true,
                  overflow: TextOverflow.visible,
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 10),
                  margin: EdgeInsets.only(right: 6),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.green_0CB34B, AppColors.green_22C35D],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(color: AppColors.white_F8F7FC, width: 1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextButton(
                    style: TextButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(
                        vertical: 11,
                        horizontal: 4,
                      ),
                    ),
                    onPressed: () async {
                      final Uri launchUri = Uri(
                        scheme: 'tel',
                        path: detailOrder.shopProfile.phoneNumber,
                      );
                      if (await canLaunchUrl(launchUri)) {
                        await launchUrl(launchUri);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(AppStrings.unable_to_make_call),
                          ),
                        );
                      }
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SvgPicture.asset(
                          "assets/images/ic_phone.svg",
                          colorFilter: ColorFilter.mode(
                            AppColors.white_F8F7FC,
                            BlendMode.srcIn,
                          ),
                          width: 15,
                          height: 15,
                        ),
                        SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            AppStrings.call,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontFamily: "Inter_regular",
                              fontSize: 13,
                              color: AppColors.white_F8F7FC,
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
                  padding: EdgeInsetsDirectional.symmetric(
                    vertical: 0,
                    horizontal: 10,
                  ),
                  margin: EdgeInsets.only(right: 6),
                  decoration: BoxDecoration(
                    color: AppColors.gray_EDEFF3,
                    border: Border.all(color: AppColors.white_F8F7FC, width: 1),
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
                    onPressed: () async {
                      final Uri smsUri = Uri(
                        scheme: 'sms',
                        path: detailOrder.shopProfile.phoneNumber,
                      );
                      if (await canLaunchUrl(smsUri)) {
                        await launchUrl(smsUri);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              AppStrings.can_not_open_messaging_app,
                            ),
                          ),
                        );
                      }
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          "assets/images/ic_chat.svg",
                          colorFilter: ColorFilter.mode(
                            AppColors.blue_344256,
                            BlendMode.srcIn,
                          ),
                          width: 15,
                          height: 15,
                        ),
                        SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            AppStrings.chat,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
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
