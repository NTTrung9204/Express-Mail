import 'dart:convert';
import 'package:express_mail/data/model/User.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class LoginViewModel extends ChangeNotifier {
  bool _isLoading = false;

  bool get isLoading => _isLoading;

  User? _user;

  User? get user => _user;

  String? _errorMessage;

  String? get errorMessage => _errorMessage;

  set errorMessage(String? value) {
    _errorMessage = value;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _setLoading(true);
    _errorMessage = null;

    try {
      final response = await http.post(
        Uri.parse('https://express-mail-pbl6.work.gd/api/v1/auth/login/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _user = User.fromJson(data['user']);
        _setLoading(false);
        return true;
      } else {
        final error = jsonDecode(response.body);
        _errorMessage = error['message'] ?? AppStrings.wrong_information;
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _errorMessage = '${AppStrings.connection_error}: $e';
      _setLoading(false);
      return false;
    }
  }
}
