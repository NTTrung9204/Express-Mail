import 'dart:convert';
import 'package:express_mail/constants/Constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/data/model/User.dart';
import 'package:express_mail/data/model/LoginResponse.dart';

class LaunchViewModel extends ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;
  LoginResponse? _loginResponse;

  bool get isLoading => _isLoading;

  String? get errorMessage => _errorMessage;

  LoginResponse? get loginResponse => _loginResponse;

  User? get user => _loginResponse?.user;

  String? get accessToken => _loginResponse?.access;

  String? get refreshToken => _loginResponse?.refresh;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _setLoading(true);
    _errorMessage = null;

    try {
      final response = await http.post(
        Uri.parse(Constants.loginUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username.trim(),
          'password': password.trim(),
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _loginResponse = LoginResponse.fromJson(data);
        return true;
      } else {
        try {
          final errorData = jsonDecode(response.body);
          _errorMessage = errorData['message'] ?? AppStrings.wrong_information;
        } catch (_) {
          _errorMessage = AppStrings.wrong_information;
        }
        return false;
      }
    } catch (e) {
      _errorMessage = '${AppStrings.connection_error}: $e';
      return false;
    } finally {
      _setLoading(false);
    }
  }
}
