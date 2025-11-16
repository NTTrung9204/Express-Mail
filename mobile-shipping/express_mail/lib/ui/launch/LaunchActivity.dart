import 'package:express_mail/ui/launch/LaunchViewModel.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/ui/login/LoginActivity.dart';
import 'package:express_mail/constants/Constants.dart';
import 'package:lottie/lottie.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:express_mail/ui/home/HomeActivity.dart';

class LaunchActivity extends StatefulWidget {
  const LaunchActivity({super.key});

  @override
  State<LaunchActivity> createState() => _LaunchActivityState();
}

class _LaunchActivityState extends State<LaunchActivity>
    with SingleTickerProviderStateMixin {
  late LaunchViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = LaunchViewModel();
    _checkLogin();
  }

  Future<void> _checkLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUsername = prefs.getString(Constants.username) ?? '';
    final savedPassword = prefs.getString(Constants.password) ?? '';
    final autoLogin = prefs.getBool(Constants.auto_login) ?? false;

    await Future.delayed(const Duration(seconds: 5));

    if (!mounted) return;

    if (autoLogin && savedUsername.isNotEmpty && savedPassword.isNotEmpty) {
      bool success = await _viewModel.login(savedUsername, savedPassword);
      if (!mounted) return;

      if (success) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) =>
                HomeActivity(loginResponse: _viewModel.loginResponse!),
          ),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => LoginActivity()),
        );
      }
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => LoginActivity()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      body: Stack(
        children: [
          SizedBox(
            width: screenWidth,
            height: screenHeight,
            child: Image.asset(
              'assets/images/img_background.webp',
              fit: BoxFit.cover,
            ),
          ),
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  children: [
                    SizedBox(height: screenHeight * 0.15),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.asset(
                        'assets/images/img_app.jpg',
                        width: 150,
                        height: 150,
                        fit: BoxFit.fill,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      AppStrings.app_name,
                      style: TextStyle(
                        color: AppColors.blue_127AE2,
                        fontSize: 26,
                        fontFamily: "Inter_bold",
                        shadows: [
                          Shadow(
                            offset: Offset(1, 1),
                            blurRadius: 2,
                            color: Colors.black38,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: SizedBox(
                    width: double.infinity,
                    height: 80,
                    child: Lottie.asset(
                      'assets/animation/ani_loading_splash.json',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
