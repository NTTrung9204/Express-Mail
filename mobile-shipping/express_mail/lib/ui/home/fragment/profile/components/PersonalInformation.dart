import 'package:express_mail/data/model/Shipper.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class PersonalInformation extends StatefulWidget {
  final Shipper shipper;

  const PersonalInformation({super.key, required this.shipper});

  @override
  State<PersonalInformation> createState() => _PersonalInformationState();
}

class _PersonalInformationState extends State<PersonalInformation> {
  late Shipper shipper;

  @override
  void initState() {
    super.initState();
    shipper = widget.shipper;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      padding: EdgeInsetsGeometry.all(25),
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray_DADFE7, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SvgPicture.asset(
                "assets/images/ic_username.svg",
                colorFilter: ColorFilter.mode(
                  AppColors.blue_127AE2,
                  BlendMode.srcIn,
                ),
                width: 23,
                height: 23,
              ),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  AppStrings.personal_information,
                  style: TextStyle(
                    fontSize: 23,
                    fontFamily: "Inter_bold",
                    color: AppColors.blue_344256,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: Text(
                  AppStrings.full_name,
                  style: TextStyle(
                    color: AppColors.blue_344256,
                    fontFamily: "Inter_regular",
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: EdgeInsetsDirectional.symmetric(
                    horizontal: 13,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.gray_EDEFF3,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.gray_DADFE7, width: 1),
                  ),
                  child: Text(
                    shipper.fullName,
                    style: TextStyle(
                      color: AppColors.blue_344256,
                      fontFamily: "Inter_regular",
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: Text(
                  AppStrings.email,
                  style: TextStyle(
                    color: AppColors.blue_344256,
                    fontFamily: "Inter_regular",
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: EdgeInsetsDirectional.symmetric(
                    horizontal: 13,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.gray_EDEFF3,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.gray_DADFE7, width: 1),
                  ),
                  child: Text(
                    shipper.email,
                    style: TextStyle(
                      color: AppColors.blue_344256,
                      fontFamily: "Inter_regular",
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: Text(
                  AppStrings.phone_number,
                  style: TextStyle(
                    color: AppColors.blue_344256,
                    fontFamily: "Inter_regular",
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: EdgeInsetsDirectional.symmetric(
                    horizontal: 13,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.gray_EDEFF3,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.gray_DADFE7, width: 1),
                  ),
                  child: Text(
                    shipper.phone ?? '',
                    style: TextStyle(
                      color: AppColors.blue_344256,
                      fontFamily: "Inter_regular",
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: Text(
                  AppStrings.address,
                  style: TextStyle(
                    color: AppColors.blue_344256,
                    fontFamily: "Inter_regular",
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: EdgeInsetsDirectional.symmetric(
                    horizontal: 13,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.gray_EDEFF3,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.gray_DADFE7, width: 1),
                  ),
                  child: Text(
                    [
                      shipper.address ?? '',
                      shipper.wardCommune ?? '',
                      shipper.provinceCity ?? '',
                    ].where((e) => e.trim().isNotEmpty).join(', '),
                    style: TextStyle(
                      color: AppColors.blue_344256,
                      fontFamily: "Inter_regular",
                      fontSize: 15,
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

/// Builder cho 2 giá trị: distance và time
class DistanceTimeBuilder<A, B, C> extends StatelessWidget {
  final ValueNotifier<A> first;
  final ValueNotifier<B> second;
  final ValueNotifier<C> third;
  final Widget Function(BuildContext, A, B, C, Widget?) builder;

  const DistanceTimeBuilder({
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

// HEADER COLUMN ITEM
Widget buildHeader(String myText, String title, Color color, bool isLoading) {
  return Column(
    children: [
      isLoading
          ? SizedBox(
              key: const ValueKey("loading"),
              height: 30,
              child: Lottie.asset(
                'assets/animation/ani_load.json',
                fit: BoxFit.contain,
                repeat: true,
              ),
            )
          : Text(
              key: ValueKey("content"),
              myText,
              style: TextStyle(
                fontSize: 17,
                color: color,
                fontFamily: "Inter_bold",
              ),
            ),
      SizedBox(height: 5),
      Text(
        title,
        style: TextStyle(
          fontSize: 11,
          color: AppColors.gray_7B899D,
          fontFamily: "Inter_regular",
        ),
      ),
    ],
  );
}
