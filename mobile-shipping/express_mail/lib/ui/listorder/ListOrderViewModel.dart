import 'dart:convert';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/constants/Constants.dart';

class ListOrderViewModel extends ChangeNotifier {
  bool _isCompletingOrder = false;

  bool get isCompletingOrder => _isCompletingOrder;

  // --- Complete order by orderId ---
  Future<bool> completeOrder(
    LoginResponse loginResponse,
    ShippingOrder order,
    String status,
  ) async {
    _isCompletingOrder = true;
    notifyListeners();

    final url = "${Constants.baseUrlTrung}/shipping";

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${loginResponse.access}',
          'accept': 'application/json',
        },
        body: jsonEncode({
          "orderId": order.id,
          "status": status,
          "shipperId": loginResponse.user.id.toString(),
          "routeStepId": int.parse(order.routeStep.id.toString()),
        }),
      );

      if (response.statusCode == 201) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    } finally {
      _isCompletingOrder = false;
      notifyListeners();
    }
  }
}
