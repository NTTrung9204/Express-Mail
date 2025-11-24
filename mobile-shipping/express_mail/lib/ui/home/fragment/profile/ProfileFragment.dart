import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/ui/home/fragment/profile/ProfileViewModel.dart';
import 'package:express_mail/ui/home/fragment/profile/VerifyCodeActivity.dart';
import 'package:express_mail/ui/home/fragment/profile/components/HeaderProfile.dart';
import 'package:express_mail/ui/home/fragment/profile/components/PersonalInformation.dart';
import 'package:express_mail/ui/home/fragment/profile/components/VehicleInformation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shimmer/shimmer.dart';

class ProfileFragment extends StatefulWidget {
  final LoginResponse loginResponse;

  const ProfileFragment({super.key, required this.loginResponse});

  @override
  State<ProfileFragment> createState() => _ProfileFragmentState();
}

class _ProfileFragmentState extends State<ProfileFragment> {
  late ProfileViewModel profileViewModel;
  bool autoLogin = false;

  @override
  void initState() {
    super.initState();
    profileViewModel = ProfileViewModel();
    profileViewModel.getProfile(widget.loginResponse);
    _loadAutoLogin();
  }

  @override
  void dispose() {
    profileViewModel.dispose();
    super.dispose();
  }

  Future<void> _loadAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final savedValue = prefs.getBool(Constants.auto_login) ?? true;
    setState(() {
      autoLogin = savedValue;
    });
  }

  Future<void> _saveAutoLogin(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(Constants.auto_login, value);
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<ProfileViewModel>.value(
      value: profileViewModel,
      child: Consumer<ProfileViewModel>(
        builder: (context, model, _) {
          final profile = model.profile;

          return Scaffold(
            backgroundColor: AppColors.gray_F7F7FC,
            body: SafeArea(child: _buildBody(model.isLoading, profile)),
          );
        },
      ),
    );
  }

  Widget _buildBody(bool isLoading, profile) {
    if (isLoading) {
      // Loading shimmer
      return Column(
        children: [
          HeaderProfile(
            loginResponse: widget.loginResponse,
            profile: profile,
            profileViewModel: profileViewModel,
          ),
          Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    PersonalInformation(
                      loginResponse: widget.loginResponse,
                      profile: profile,
                      profileViewModel: profileViewModel,
                    ),
                    const SizedBox(height: 16),
                    VehicleInformation(
                      loginResponse: widget.loginResponse,
                      profile: profile,
                      profileViewModel: profileViewModel,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
    }

    if (profile == null) {
      // No data
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 30),
              child: AspectRatio(
                aspectRatio: 1,
                child: Image.asset(
                  "assets/images/img_no_data_profile.webp",
                  fit: BoxFit.contain,
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              AppStrings.no_profile_data,
              style: TextStyle(color: Colors.black54, fontSize: 18),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    // Profile loaded
    return Column(
      children: [
        HeaderProfile(
          loginResponse: widget.loginResponse,
          profile: profile,
          profileViewModel: profileViewModel,
        ),
        Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: SingleChildScrollView(
              child: Column(
                children: [
                  PersonalInformation(
                    loginResponse: widget.loginResponse,
                    profile: profile,
                    profileViewModel: profileViewModel,
                  ),
                  const SizedBox(height: 16),
                  VehicleInformation(
                    loginResponse: widget.loginResponse,
                    profile: profile,
                    profileViewModel: profileViewModel,
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(25),
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.gray_DADFE7,
                        width: 1,
                      ),
                    ),
                    child: _buildExtraOptions(
                      isLoading: profileViewModel.isLoading,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExtraOptions({bool isLoading = false}) {
    if (isLoading) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Shimmer.fromColors(
            baseColor: AppColors.gray_E0E5EB,
            highlightColor: Colors.white,
            child: Container(width: 150, height: 23, color: Colors.white),
          ),
          const SizedBox(height: 18),
          // Shimmer cho auto-login
          Shimmer.fromColors(
            baseColor: AppColors.gray_E0E5EB,
            highlightColor: Colors.white,
            child: Container(height: 40, color: Colors.white),
          ),
          const SizedBox(height: 8),
          // Shimmer cho change-password
          Shimmer.fromColors(
            baseColor: AppColors.gray_E0E5EB,
            highlightColor: Colors.white,
            child: Container(height: 40, color: Colors.white),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.notifications_none_outlined,
              size: 23,
              color: AppColors.blue_0680F9,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                AppStrings.settings,
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

        GestureDetector(
          onTap: () {
            setState(() {
              autoLogin = !autoLogin;
              _saveAutoLogin(autoLogin);
            });
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.login, color: AppColors.blue_0680F9),
                  SizedBox(width: 12),
                  Text(
                    AppStrings.automatically_login,
                    style: TextStyle(
                      fontSize: 16,
                      fontFamily: "Inter_regular",
                      color: AppColors.blue_344256,
                    ),
                  ),
                ],
              ),
              Switch(
                value: autoLogin,
                onChanged: (value) {
                  setState(() {
                    autoLogin = value;
                    _saveAutoLogin(autoLogin);
                  });
                },
                activeTrackColor: AppColors.blue_5AA6F2,
                inactiveThumbColor: Colors.grey.shade400,
                inactiveTrackColor: Colors.grey.shade300,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ],
          ),
        ),
        SizedBox(height: 16),
        const Divider(height: 2, color: AppColors.gray_DADFE7),
        SizedBox(height: 16),
        GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) =>
                    VerifyCodeActivity(loginResponse: widget.loginResponse),
              ),
            );
          },
          child: Row(
            children: const [
              Icon(Icons.lock, color: AppColors.blue_0680F9),
              SizedBox(width: 12),
              Text(
                AppStrings.change_password,
                style: TextStyle(
                  fontSize: 16,
                  fontFamily: "Inter_regular",
                  color: AppColors.blue_344256,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
