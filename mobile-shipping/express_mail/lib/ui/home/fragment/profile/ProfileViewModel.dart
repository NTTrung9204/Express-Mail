import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/Profile.dart';
import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/resources/strings.dart';

class ProfileViewModel extends ChangeNotifier {
  bool _isLoading = false;
  bool _isLoadingLogout = false;

  bool get isLoading => _isLoading;

  bool get isLoadingLogout => _isLoadingLogout;

  Profile? _profile;

  Profile? get profile => _profile;

  String? _errorMessage;
  String? _errorMessageLogout;

  String? get errorMessage => _errorMessage;

  String? get errorMessageLogout => _errorMessageLogout;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setLoadingLogout(bool value) {
    _isLoadingLogout = value;
    notifyListeners();
  }

  void _setError(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  void _setErrorLogout(String message) {
    _errorMessageLogout = message;
    notifyListeners();
  }

  void _setProfile(Profile profile) {
    _profile = profile;
    notifyListeners();
  }

  Future<Profile?> getProfile(LoginResponse loginResponse) async {
    _setLoading(true);
    _errorMessage = null;

    final url = '${Constants.profileUrl}${loginResponse.user.id}/profile';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${loginResponse.access}',
        },
      );

      if (response.statusCode != 200) {
        final error = jsonDecode(response.body);
        _setError(error['message'] ?? AppStrings.connection_error);
        _setLoading(false);
        return null;
      }

      final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
      final profile = Profile.fromJson(jsonResponse);

      _setProfile(profile);
      _setLoading(false);
      return _profile;
    } catch (e, stack) {
      _setError('${AppStrings.connection_error}: $e');
      print(stack);
      _setLoading(false);
      return null;
    }
  }

  Future<bool> logout(LoginResponse loginResponse) async {
    _setLoadingLogout(true);
    _errorMessageLogout = null;

    final url = Constants.logoutUrl;

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'access': loginResponse.access,
          'refresh': loginResponse.refresh,
        }),
      );
      if (response.statusCode == 204) {
        _setLoadingLogout(false);
        return true;
      } else {
        final error = jsonDecode(response.body);
        _setErrorLogout(error['message'] ?? AppStrings.connection_error);
        _setLoadingLogout(false);
        return false;
      }
    } catch (e, stack) {
      _setErrorLogout('${AppStrings.connection_error}: $e');
      print(stack);
      _setLoadingLogout(false);
      return false;
    }
  }

  //Confirm OTP
  bool _isLoadingReset = false;
  String? _errorMessageReset;

  bool get isLoadingReset => _isLoadingReset;

  String? get errorMessageReset => _errorMessageReset;

  void _setLoadingReset(bool value) {
    _isLoadingReset = value;
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
  Future<bool> reset(String email) async {
    _setLoadingReset(true);
    _errorMessageReset = null;

    try {
      final response = await http.post(
        Uri.parse(Constants.forgotUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email.trim()}),
      );

      if (response.statusCode == 200) {
        _errorMessageReset = null;
        return true;
      } else {
        if (response.statusCode == 429) {
          final decoded = json.decode(response.body);
          final detail = decoded['detail'] as String;

          final regex = RegExp(r'(\d+)\s*seconds');
          final match = regex.firstMatch(detail);

          if (match != null) {
            final seconds = int.parse(match.group(1)!);
            _errorMessageReset =  '${AppStrings.please_try_again_later} $seconds ${AppStrings.second}';
          }
          return false;
        } else {
          final errorData = jsonDecode(response.body);
          _errorMessageReset =
              errorData['message'] ??
                  AppStrings.an_error_occurred_please_try_again;
          return false;
        }
      }
    } catch (e) {
      _errorMessageReset = AppStrings.connection_error;
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
        if (response.statusCode == 400) {
          _errorMessageConfirm = AppStrings.invalid_opt_code;
          return false;
        } else {
          if (response.statusCode == 429) {
            final decoded = json.decode(response.body);
            final detail = decoded['detail'] as String;

            final regex = RegExp(r'(\d+)\s*seconds');
            final match = regex.firstMatch(detail);
            if (match != null) {
              final seconds = int.parse(match.group(1)!);
              _errorMessageConfirm =
              '${AppStrings.please_try_again_later} $seconds ${AppStrings
                  .second}';
            }
            return false;
          } else {
            final errorData = jsonDecode(response.body);
            _errorMessageConfirm =
                errorData['message'] ??
                    AppStrings.an_error_occurred_please_try_again;
            return false;
          }
        }
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
