import 'dart:convert';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/data/model/User.dart';
import 'package:express_mail/data/model/DetailOrder.dart';

class HomeFragmentViewModel extends ChangeNotifier {
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  User? _user;
  User? get user => _user;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  List<DetailOrder> _orders = [];
  List<DetailOrder> get orders => _orders;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  void _setOrders(List<DetailOrder> list) {
    _orders = list;
    notifyListeners();
  }

  Future<List<DetailOrder>?> getListOrder(LoginResponse loginResponse,
      {int page = 1, int limit = 5}) async {
    _setLoading(true);
    _errorMessage = null;

    final url =
        '${Constants.shipperOrderUrl}${loginResponse.user.id}?page=$page&limit=$limit';

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
        _setError(error['message'] ?? '');
        _setLoading(false);
        return null;
      }

      final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
      final List<dynamic> orderData = jsonResponse['data']?['data'] ?? [];

      final List<DetailOrder> listOrders = orderData
          .map((item) => DetailOrder.fromJson(Map<String, dynamic>.from(item)))
          .toList();

      _setOrders(listOrders);
      _setLoading(false);
      return _orders;
    } catch (e, stack) {
      _setError('${AppStrings.connection_error}: $e');
      print(stack);
      _setLoading(false);
      return null;
    }
  }
}
