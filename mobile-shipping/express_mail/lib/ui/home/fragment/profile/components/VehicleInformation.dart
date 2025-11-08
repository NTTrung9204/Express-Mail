import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/Profile.dart';
import 'package:express_mail/ui/home/fragment/profile/ProfileViewModel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:shimmer/shimmer.dart';

class VehicleInformation extends StatelessWidget {
  final LoginResponse loginResponse;
  final Profile? profile;
  final ProfileViewModel profileViewModel;

  const VehicleInformation({
    super.key,
    required this.loginResponse,
    required this.profile,
    required this.profileViewModel,
  });

  @override
  Widget build(BuildContext context) {
    final showShimmer = profileViewModel.isLoading || profile == null;

    return Container(
      padding: const EdgeInsets.all(25),
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray_DADFE7, width: 1),
      ),
      child: showShimmer ? _buildShimmer() : _buildContent(),
    );
  }

  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            SvgPicture.asset(
              "assets/images/ic_car.svg",
              colorFilter: const ColorFilter.mode(
                AppColors.blue_127AE2,
                BlendMode.srcIn,
              ),
              width: 23,
              height: 23,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                AppStrings.vehicle_information,
                style: const TextStyle(
                  fontSize: 23,
                  fontFamily: "Inter_bold",
                  color: AppColors.blue_344256,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildField(AppStrings.model, profile?.motorModel),
            _buildField(
              AppStrings.license_plate_number,
              profile?.licensePlateNumber,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildField(String label, String? value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.blue_344256,
              fontFamily: "Inter_regular",
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value != null && value.isNotEmpty ? value : '—',
            style: const TextStyle(
              color: AppColors.blue_344256,
              fontFamily: "Inter_regular",
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 160, height: 25, color: Colors.white),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _shimmerBox(width: 80, height: 13),
                    const SizedBox(height: 4),
                    _shimmerBox(width: 120, height: 13),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _shimmerBox(width: 100, height: 13),
                    const SizedBox(height: 4),
                    _shimmerBox(width: 100, height: 13),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _shimmerBox({required double width, required double height}) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
      ),
    );
  }
}
