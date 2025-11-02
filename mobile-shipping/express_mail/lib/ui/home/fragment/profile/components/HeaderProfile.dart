import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/Profile.dart';
import 'package:express_mail/ui/home/fragment/profile/ProfileViewModel.dart';
import 'package:express_mail/ui/login/LoginActivity.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class HeaderProfile extends StatelessWidget {
  final Profile profile;
  final LoginResponse loginResponse;
  final ProfileViewModel profileViewModel;

  const HeaderProfile({
    super.key,
    required this.loginResponse,
    required this.profile,
    required this.profileViewModel,
  });

  void _onLogoutPressed(BuildContext context) {
    final pageContext = context; // lưu context gốc của page

    showGeneralDialog(
      context: pageContext,
      barrierLabel: "logoutDialog",
      barrierDismissible: true,
      barrierColor: Colors.black.withOpacity(0.4),
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, anim1, anim2) {
        return Center(
          child: Container(
            width: MediaQuery.of(pageContext).size.width * 0.85,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.15),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    AppStrings.confirm_logout,
                    style: TextStyle(
                      fontFamily: "Inter_bold",
                      fontSize: 18,
                      color: AppColors.blue_344256,
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    AppStrings.are_you_sure_you_want_to_log_out_of_the_app,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: "Inter_regular",
                      fontSize: 15,
                      color: AppColors.gray_7B899D,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.of(
                          pageContext,
                          rootNavigator: true,
                        ).pop(),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 10,
                          ),
                        ),
                        child: const Text(
                          AppStrings.cancel,
                          style: TextStyle(
                            fontFamily: "Inter_regular",
                            fontSize: 14,
                            color: AppColors.black,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.blue_127AE2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 10,
                          ),
                          overlayColor: AppColors.gray_E0E5EB.withOpacity(0.4),
                        ),
                        onPressed: () async {
                          Navigator.of(
                            pageContext,
                            rootNavigator: true,
                          ).pop(); // đóng confirm dialog
                          showDialog(
                            context: pageContext,
                            barrierDismissible: false,
                            builder: (_) => const Center(
                              child: CircularProgressIndicator(
                                color: AppColors.blue_127AE2,
                              ),
                            ),
                          );

                          final success = await profileViewModel.logout(
                            loginResponse,
                          );

                          Navigator.of(pageContext, rootNavigator: true).pop();

                          if (success) {
                            if (pageContext.mounted) {
                              Navigator.pushAndRemoveUntil(
                                pageContext,
                                MaterialPageRoute(
                                  builder: (_) => LoginActivity(),
                                ),
                                (route) => false,
                              );
                            }
                          } else {
                            if (pageContext.mounted) {
                              ScaffoldMessenger.of(pageContext).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    profileViewModel.errorMessageLogout ??
                                        AppStrings.connection_error,
                                  ),
                                  backgroundColor: Colors.redAccent,
                                ),
                              );
                            }
                          }
                        },
                        child: const Text(
                          AppStrings.logout,
                          style: TextStyle(
                            fontFamily: "Inter_regular",
                            fontSize: 15,
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
      transitionBuilder: (context, anim1, anim2, child) {
        return FadeTransition(
          opacity: CurvedAnimation(parent: anim1, curve: Curves.easeOut),
          child: ScaleTransition(
            scale: CurvedAnimation(parent: anim1, curve: Curves.easeOutBack),
            child: child,
          ),
        );
      },
    );
  }

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
                onPressed: () => _onLogoutPressed(context),
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
                          errorBuilder: (_, __, ___) => const Icon(
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
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  loginResponse.user.fullName.isNotEmpty
                      ? loginResponse.user.fullName
                      : AppStrings.user,
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
