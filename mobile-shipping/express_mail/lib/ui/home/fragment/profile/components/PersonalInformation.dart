import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/Profile.dart';
import 'package:express_mail/ui/home/fragment/profile/ProfileViewModel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:shimmer/shimmer.dart';

class PersonalInformation extends StatelessWidget {
  final LoginResponse? loginResponse;
  final Profile? profile;
  final ProfileViewModel profileViewModel;

  const PersonalInformation({
    super.key,
    required this.loginResponse,
    required this.profile,
    required this.profileViewModel,
  });

  @override
  Widget build(BuildContext context) {
    final showShimmer =
        profileViewModel.isLoading || loginResponse == null || profile == null;

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

  ///CONTENT
  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildHeader(),
        const SizedBox(height: 20),
        _buildField(AppStrings.full_name, loginResponse!.user.fullName),
        const SizedBox(height: 16),
        _buildField(AppStrings.email, loginResponse!.user.email),
        const SizedBox(height: 16),
        _buildField(AppStrings.phone_number, profile?.phoneNumber ?? ''),
        const SizedBox(height: 16),
        _buildField(
          AppStrings.address,
          [profile?.address ?? ''].where((e) => e.trim().isNotEmpty).join(', '),
        ),
      ],
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        SvgPicture.asset(
          "assets/images/ic_username.svg",
          colorFilter: const ColorFilter.mode(
            AppColors.blue_127AE2,
            BlendMode.srcIn,
          ),
          width: 24,
          height: 24,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            AppStrings.personal_information,
            style: const TextStyle(
              fontSize: 22,
              fontFamily: "Inter_bold",
              color: AppColors.blue_344256,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildField(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontFamily: "Inter_regular",
            color: AppColors.blue_344256,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.gray_EDEFF3,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.gray_DADFE7, width: 1),
          ),
          child: Text(
            value.isNotEmpty ? value : '—',
            style: const TextStyle(
              fontSize: 15,
              fontFamily: "Inter_regular",
              color: AppColors.blue_344256,
            ),
          ),
        ),
      ],
    );
  }

  ///SHIMMER
  Widget _buildShimmer() {
    const double labelHeight = 13;
    const double fieldHeight = 45;
    const double spacing = 18;
    const double borderRadius = 10.0;

    Widget shimmerField({double labelWidth = 100}) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: labelWidth,
            height: labelHeight,
            color: Colors.white,
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            height: fieldHeight,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(borderRadius),
            ),
          ),
        ],
      );
    }

    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header shimmer
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 10),
              Container(width: 180, height: 22, color: Colors.white),
            ],
          ),
          const SizedBox(height: spacing),
          // Fields shimmer
          for (int i = 0; i < 4; i++) ...[
            shimmerField(),
            const SizedBox(height: spacing),
          ],
        ],
      ),
    );
  }
}
