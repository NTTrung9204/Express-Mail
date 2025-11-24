import 'User.dart';

class LoginResponse {
  final String refresh;
  final String access;
  final User user;

  const LoginResponse({
    required this.refresh,
    required this.access,
    required this.user,
  });

  /// Parse JSON → LoginResponse
  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      refresh: json['refresh'] ?? '',
      access: json['access'] ?? '',
      user: User.fromJson(json['user'] ?? {}),
    );
  }

  /// LoginResponse → JSON
  Map<String, dynamic> toJson() {
    return {'refresh': refresh, 'access': access, 'user': user.toJson()};
  }
}
