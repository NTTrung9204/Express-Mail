import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/ui/home/fragment/earning/EarningFragment.dart';
import 'package:express_mail/ui/home/fragment/home/HomeFragment.dart';
import 'package:express_mail/ui/home/fragment/order/OrderFragment.dart';
import 'package:express_mail/ui/home/fragment/profile/ProfileFragment.dart';
import 'package:express_mail/ui/home/fragment/map/MapFragment.dart';

import '../../resources/strings.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../resources/colors.dart';

class HomeActivity extends StatelessWidget {
  final LoginResponse loginResponse;

  const HomeActivity({super.key, required this.loginResponse});

  @override
  Widget build(BuildContext context) {
    return HomeScreen(loginResponse: loginResponse);
  }
}

class HomeScreen extends StatefulWidget {
  final LoginResponse loginResponse;

  const HomeScreen({super.key, required this.loginResponse});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  late final List<Widget> _fragments = [
    HomeFragment(loginResponse: widget.loginResponse),
    OrderFragment(loginResponse: widget.loginResponse),
    // MapFragment(),
    EarningFragment(loginResponse: widget.loginResponse),
    ProfileFragment(loginResponse: widget.loginResponse),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.blue_127AE2, AppColors.blue_5AA6F2],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: _fragments[_selectedIndex],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.gray_7B899D, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          type: BottomNavigationBarType.fixed,
          showSelectedLabels: true,
          showUnselectedLabels: true,
          selectedItemColor: AppColors.blue_127AE2,
          unselectedItemColor: AppColors.gray_7B899D,
          selectedLabelStyle: const TextStyle(
            fontSize: 12,
            fontFamily: "Inter_regular",
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: 12,
            fontFamily: "Inter_regular",
          ),
          items: [
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                "assets/images/ic_home.svg",
                colorFilter: ColorFilter.mode(
                  _selectedIndex == 0
                      ? AppColors.blue_127AE2
                      : AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
              ),
              label: AppStrings.home,
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                "assets/images/ic_order.svg",
                colorFilter: ColorFilter.mode(
                  _selectedIndex == 1
                      ? AppColors.blue_127AE2
                      : AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
              ),
              label: AppStrings.order,
            ),
            // BottomNavigationBarItem(
            //   icon: SvgPicture.asset(
            //     "assets/images/ic_map.svg",
            //     colorFilter: ColorFilter.mode(
            //       _selectedIndex == 2
            //           ? AppColors.blue_127AE2
            //           : AppColors.gray_7B899D,
            //       BlendMode.srcIn,
            //     ),
            //   ),
            //   label: AppStrings.map,
            // ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                "assets/images/ic_earning.svg",
                colorFilter: ColorFilter.mode(
                  _selectedIndex == 2
                      ? AppColors.blue_127AE2
                      : AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
              ),
              label: AppStrings.earning,
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                "assets/images/ic_profile.svg",
                colorFilter: ColorFilter.mode(
                  _selectedIndex == 3
                      ? AppColors.blue_127AE2
                      : AppColors.gray_7B899D,
                  BlendMode.srcIn,
                ),
              ),
              label: AppStrings.profile,
            ),
          ],
          onTap: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
        ),
      ),
    );
  }
}
