import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/ui/home/fragment/profile/ProfileViewModel.dart';
import 'package:express_mail/ui/home/fragment/profile/components/HeaderProfile.dart';
import 'package:express_mail/ui/home/fragment/profile/components/PersonalInformation.dart';
import 'package:express_mail/ui/home/fragment/profile/components/VehicleInformation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ProfileFragment extends StatefulWidget {
  final LoginResponse loginResponse;

  const ProfileFragment({super.key, required this.loginResponse});

  @override
  State<ProfileFragment> createState() => _ProfileFragmentState();
}

class _ProfileFragmentState extends State<ProfileFragment> {
  late ProfileViewModel profileViewModel;

  @override
  void initState() {
    super.initState();
    profileViewModel = ProfileViewModel();
    profileViewModel.getProfile(widget.loginResponse);
  }

  @override
  void dispose() {
    profileViewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<ProfileViewModel>.value(
      value: profileViewModel,
      child: Consumer<ProfileViewModel>(
        builder: (context, model, _) {
          if (model.isLoading) {
            return Scaffold(
              backgroundColor: AppColors.white,
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      color: AppColors.blue_127AE2,
                      strokeWidth: 4,
                    ),
                    const SizedBox(height: 22),
                    const Text(
                      AppStrings.loading_data,
                      style: TextStyle(
                        fontFamily: "Inter_regular",
                        fontSize: 16,
                        color: AppColors.black,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          final profile = model.profile;
          if (profile == null) {
            return const Scaffold(
              backgroundColor: AppColors.white,
              body: Center(
                child: Text(
                  AppStrings.no_profile_data,
                  style: TextStyle(
                    fontSize: 30,
                    fontFamily: "Inter_bold",
                    color: AppColors.black,
                  ),
                ),
              ),
            );
          }
          return Scaffold(
            backgroundColor: AppColors.gray_F7F7FC,
            body: SafeArea(
              child: Column(
                children: [
                  HeaderProfile(
                    loginResponse: widget.loginResponse,
                    profile: profile,
                  ),
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(
                        vertical: 16,
                        horizontal: 16,
                      ),
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            PersonalInformation(
                              loginResponse: widget.loginResponse,
                              profile: profile,
                            ),
                            SizedBox(height: 16),
                            VehicleInformation(
                              loginResponse: widget.loginResponse,
                              profile: profile,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
