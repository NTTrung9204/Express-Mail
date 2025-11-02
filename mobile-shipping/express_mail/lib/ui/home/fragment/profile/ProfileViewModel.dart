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

    final url = '${Constants.profileUrl}${loginResponse.user.id}/profile/';

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
}
