import 'package:express_mail/resources/strings.dart';

enum OrderStatus {
  PENDING(AppStrings.pending),
  CANCELED(AppStrings.canceled),
  COMPLETED(AppStrings.completed);

  final String status;
  const OrderStatus(this.status);
}
