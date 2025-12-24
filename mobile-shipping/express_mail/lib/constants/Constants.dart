import 'package:flutter_dotenv/flutter_dotenv.dart';

class Constants {
  // Base URLs
  static const String baseUrlTai = 'https://express-mail-pbl6.work.gd/api/v1';
  static const String baseUrlTrung = 'http://52.221.79.114:3000';

  // Auth
  static const String loginUrl = '$baseUrlTai/auth/login';
  static const String forgotUrl = '$baseUrlTai/reset-password/request';
  static const String verifyUrl = '$baseUrlTai/reset-password/verify';
  static const String resetPasswordUrl = '$baseUrlTai/reset-password/confirm';

  // Shipper
  static const String shipperOrderUrl = '$baseUrlTrung/shipping/shipper/';
  static const String profileUrl = '$baseUrlTai/users/';
  static const String logoutUrl = '$baseUrlTai/auth/logout';

  // User
  // static const String userProfileUrl = '$baseUrlTai/user/profile/';

  static const int requestTimeout = 15000;

  // Key names for storage
  static const String keyAccessToken = 'ACCESS_TOKEN';
  static const String keyRefreshToken = 'REFRESH_TOKEN';
  static const String keyUser = 'USER_DATA';
  static const int limit = 10;
  static const int maxLimit = 10000;
  static const String username = 'USERNAME';
  static const String password = 'PASSWORD';
  static const String auto_login = 'AUTO_LOGIN';

  // API Keys from .env
  static String get keyMap => dotenv.env['KEY_MAP'] ?? '';

  static String role = "shipper";
}
