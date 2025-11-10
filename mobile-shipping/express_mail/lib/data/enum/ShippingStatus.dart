import 'dart:ui';

import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/resources/colors.dart';

enum ShippingStatus {
  PICKUP_REQUESTED(
    "PICKUP_REQUESTED",
    AppStrings.pickup_requested,
    AppColors.yellow_F8C630,
  ),
  SHIPPING("SHIPPING", AppStrings.shipping, AppColors.green_22C35D),
  RETURNING("RETURNING", AppStrings.returning, AppColors.red_FF6E6E),
  FINISHED("FINISHED", AppStrings.delivered, AppColors.green_22C35D);

  final String key;
  final String name;
  final Color color;

  const ShippingStatus(this.key, this.name, this.color);
}
