import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/ui/home/fragment/profile/ProfileViewModel.dart';
import 'package:express_mail/ui/home/fragment/profile/components/CehicleInfomation.dart';
import 'package:express_mail/ui/home/fragment/profile/components/HeaderProfile.dart';
import 'package:express_mail/ui/home/fragment/profile/components/PersonalInformation.dart';
import 'package:flutter/material.dart';

class ProfileFragment extends StatefulWidget {
  const ProfileFragment({super.key});

  @override
  State<ProfileFragment> createState() => _ProfileFragmentState();
}

class _ProfileFragmentState extends State<ProfileFragment> {
  late ShipperViewModel shipperViewModel;

  @override
  void initState() {
    super.initState();
    shipperViewModel = ShipperViewModel();
  }

  @override
  void dispose() {
    shipperViewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray_F7F7FC,
      body: SafeArea(
        child: ValueListenableBuilder<bool>(
          valueListenable: shipperViewModel.loading,
          builder: (context, isLoading, _) {
            if (isLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            final shipper = shipperViewModel.shipper.value;
            if (shipper == null) {
              return const Center(child: Text('Không có dữ liệu shipper'));
            }

            return SingleChildScrollView(
              child: Column(
                children: [
                  HeaderProfile(shipper: shipper),
                  PersonalInformation(shipper: shipper),
                  VehicleInformation(shipper: shipper),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
