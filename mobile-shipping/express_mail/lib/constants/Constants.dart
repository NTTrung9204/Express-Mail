class Constants {
  static const String baseUrlTai = 'https://express-mail-pbl6.work.gd/api/v1';
  static const String baseUrlTrung = 'http://54.179.245.38:3000';

  // Auth
  static const String loginUrl = '$baseUrlTai/auth/login/';

  // Shipper
  static const String shipperOrderUrl = '$baseUrlTrung/shipping/shipper/';

  // User
  // static const String userProfileUrl = '$baseUrlTai/user/profile/';

  static const int requestTimeout = 15000;

  // Key
  static const String keyAccessToken = 'ACCESS_TOKEN';
  static const String keyRefreshToken = 'REFRESH_TOKEN';
  static const String keyUser = 'USER_DATA';
}
