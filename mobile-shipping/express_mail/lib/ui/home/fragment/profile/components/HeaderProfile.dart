import 'dart:io';

import 'package:express_mail/data/model/Shipper.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lottie/lottie.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';

class HeaderProfile extends StatefulWidget {
  final Shipper shipper;

  const HeaderProfile({super.key, required this.shipper});

  @override
  State<HeaderProfile> createState() => _HeaderProfileState();
}

class _HeaderProfileState extends State<HeaderProfile> {
  File? _imageFile;

  late Shipper shipper;

  @override
  void initState() {
    super.initState();
    shipper = widget.shipper;
  }

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? pickedFile = await _picker.pickImage(
      source: ImageSource.gallery,
    );

    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.blue_127AE2, AppColors.blue_5AA6F2],
        ),
        border: Border(bottom: BorderSide(color: AppColors.gray_DADFE7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                AppStrings.profile,
                style: TextStyle(
                  fontFamily: "Inter_bold",
                  fontSize: 24,
                  color: AppColors.white,
                ),
              ),
              TextButton(
                onPressed: () {},
                style: ButtonStyle(
                  padding: WidgetStateProperty.all(
                    EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                  ),
                  shape: WidgetStateProperty.all(
                    RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(color: AppColors.white_20, width: 1.5),
                    ),
                  ),
                  overlayColor: WidgetStateProperty.resolveWith<Color?>((
                    states,
                  ) {
                    if (states.contains(WidgetState.pressed)) {
                      return Colors.blue.withOpacity(0.1);
                    }
                    return null;
                  }),
                ),
                child: Row(
                  children: [
                    SvgPicture.asset(
                      "assets/images/ic_edit.svg",
                      colorFilter: ColorFilter.mode(
                        AppColors.white,
                        BlendMode.srcIn,
                      ),
                      width: 14,
                      height: 14,
                    ),
                    SizedBox(width: 12),
                    Text(
                      AppStrings.edit,
                      style: TextStyle(
                        color: Colors.white,
                        fontFamily: "Inter_regular",
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 18),
          Row(
            children: [
              GestureDetector(
                onTap: _pickImage, // click vào avatar
                child: Container(
                  width: 80,
                  height: 80,
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.white_20, width: 2),
                  ),
                  child: CircleAvatar(
                    radius: 38,
                    backgroundImage: _imageFile != null
                        ? FileImage(_imageFile!) as ImageProvider
                        : NetworkImage(shipper.avatar!),
                    backgroundColor: Colors.grey[200],
                  ),
                ),
              ),
              SizedBox(width: 20),
              Expanded(
                child: Text(
                  shipper.fullName,
                  style: TextStyle(
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
