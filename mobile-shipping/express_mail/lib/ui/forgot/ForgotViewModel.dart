import 'dart:convert';
import 'package:express_mail/constants/Constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/resources/strings.dart';

class ForgotViewModel extends ChangeNotifier {
  //Forgot
  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;

  String? get errorMessage => _errorMessage;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  //Confirm OTP
  bool _isLoadingConfirm = false;
  String? _errorMessageConfirm;

  bool get isLoadingConfirm => _isLoadingConfirm;

  String? get errorMessageConfirm => _errorMessageConfirm;

  void _setLoadingConfirm(bool value) {
    _isLoadingConfirm = value;
    notifyListeners();
  }

  //Reset Password
  bool _isLoadingResetPassword = false;
  String? _errorMessageResetPassword;

  bool get isLoadingResetPassword => _isLoadingResetPassword;

  String? get errorMessageResetPassword => _errorMessageResetPassword;

  void _setLoadingResetPassword(bool value) {
    _isLoadingResetPassword = value;
    notifyListeners();
  }

  //API Methods
  Future<bool> forgot(String email) async {
    _setLoading(true);
    _errorMessage = null;

    try {
      final response = await http.post(
        Uri.parse(Constants.forgotUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email.trim()}),
      );

      if (response.statusCode == 200) {
        _errorMessage = null;
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        _errorMessage =
            errorData['message'] ??
            AppStrings.an_error_occurred_please_try_again;
        return false;
      }
    } catch (e) {
      _errorMessage = AppStrings.connection_error;
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> confirm(String email, String otp) async {
    _setLoadingConfirm(true);
    _errorMessageConfirm = null;

    try {
      final response = await http.post(
        Uri.parse(Constants.verifyUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email.trim(), 'otp': otp.trim()}),
      );

      if (response.statusCode == 200) {
        _errorMessageConfirm = null;
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        _errorMessageConfirm =
            errorData['message'] ??
            AppStrings.an_error_occurred_please_try_again;
        return false;
      }
    } catch (e) {
      _errorMessageConfirm = AppStrings.connection_error;
      return false;
    } finally {
      _setLoadingConfirm(false);
    }
  }

  Future<bool> resetPassword(
    String email,
    String otp,
    String newPassword,
  ) async {
    _setLoadingResetPassword(true);
    _errorMessageResetPassword = null;

    try {
      final response = await http.post(
        Uri.parse(Constants.resetPasswordUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email.trim(),
          'otp': otp.trim(),
          'newPassword': newPassword.trim(),
        }),
      );

      if (response.statusCode == 200) {
        _errorMessageResetPassword = null;
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        _errorMessageResetPassword =
            errorData['message'] ??
            AppStrings.an_error_occurred_please_try_again;
        return false;
      }
    } catch (e) {
      _errorMessageResetPassword = AppStrings.connection_error;
      return false;
    } finally {
      _setLoadingResetPassword(false);
    }
  }
}
