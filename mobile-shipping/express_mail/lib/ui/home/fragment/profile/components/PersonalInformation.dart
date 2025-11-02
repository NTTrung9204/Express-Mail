import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/Profile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class PersonalInformation extends StatefulWidget {
  final LoginResponse loginResponse;
  final Profile profile;

  const PersonalInformation({
    super.key,
    required this.loginResponse,
    required this.profile,
  });

  @override
  State<PersonalInformation> createState() => _PersonalInformationState();
}

class _PersonalInformationState extends State<PersonalInformation> {
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
                    loginResponse.user.fullName,
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
                    loginResponse.user.email,
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
                    profile.phoneNumber ?? '',
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
                      profile.address ?? '',
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
