import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/Profile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class VehicleInformation extends StatefulWidget {
  final LoginResponse loginResponse;
  final Profile profile;

  const VehicleInformation({
    super.key,
    required this.loginResponse,
    required this.profile,
  });

  @override
  State<VehicleInformation> createState() => _VehicleInformationState();
}

class _VehicleInformationState extends State<VehicleInformation> {
  late LoginResponse loginResponse;
  late Profile profile;

  @override
  void initState() {
    super.initState();
    loginResponse = widget.loginResponse;
    profile = widget.profile;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
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
                "assets/images/ic_car.svg",
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
                  AppStrings.vehicle_information,
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppStrings.model,
                      style: TextStyle(
                        color: AppColors.blue_344256,
                        fontFamily: "Inter_regular",
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      profile.motorModel ?? '',
                      style: TextStyle(
                        color: AppColors.blue_344256,
                        fontFamily: "Inter_regular",
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppStrings.license_plate_number,
                      style: TextStyle(
                        color: AppColors.blue_344256,
                        fontFamily: "Inter_regular",
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      profile.licensePlateNumber ?? "",
                      style: TextStyle(
                        color: AppColors.blue_344256,
                        fontFamily: "Inter_regular",
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
