import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/Profile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class HeaderProfile extends StatelessWidget {
  final Profile profile;
  final LoginResponse loginResponse;

  const HeaderProfile({
    super.key,
    required this.loginResponse,
    required this.profile,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.blue_127AE2, AppColors.blue_5AA6F2],
        ),
        border: Border(bottom: BorderSide(color: AppColors.gray_DADFE7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                AppStrings.profile,
                style: TextStyle(
                  fontFamily: "Inter_bold",
                  fontSize: 24,
                  color: AppColors.white,
                ),
              ),
              TextButton(
                onPressed: () {
                  //
                },
                style: ButtonStyle(
                  padding: WidgetStateProperty.all(
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                  ),
                  shape: WidgetStateProperty.all(
                    RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: const BorderSide(
                        color: AppColors.white_20,
                        width: 1.5,
                      ),
                    ),
                  ),
                  overlayColor: WidgetStateProperty.resolveWith<Color?>(
                    (states) => states.contains(WidgetState.pressed)
                        ? AppColors.gray_E0E5EB.withValues(alpha: 0.5)
                        : null,
                  ),
                ),
                child: Row(
                  children: [
                    SvgPicture.asset(
                      "assets/images/ic_logout.svg",
                      colorFilter: const ColorFilter.mode(
                        AppColors.white,
                        BlendMode.srcIn,
                      ),
                      width: 14,
                      height: 14,
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      AppStrings.logout,
                      style: TextStyle(
                        fontFamily: "Inter_regular",
                        fontSize: 14,
                        color: AppColors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Avatar + Name
          Row(
            children: [
              Container(
                width: 80,
                height: 80,
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.white_20, width: 2),
                ),
                child: ClipOval(
                  child: profile.avatar != null && profile.avatar!.isNotEmpty
                      ? Image.network(
                          profile.avatar!,
                          fit: BoxFit.cover,
                          width: 80,
                          height: 80,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(
                                Icons.person,
                                size: 70,
                                color: AppColors.gray_DADFE7,
                              ),
                        )
                      : const Icon(
                          Icons.person,
                          size: 70,
                          color: AppColors.gray_DADFE7,
                        ),
                ),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Text(
                  loginResponse.user.fullName,
                  style: const TextStyle(
                    fontFamily: "Inter_bold",
                    fontSize: 20,
                    color: AppColors.white,
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
