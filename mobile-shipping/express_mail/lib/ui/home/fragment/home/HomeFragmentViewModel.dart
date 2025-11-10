import 'dart:convert';
import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:intl/intl.dart';

class HomeFragmentViewModel extends ChangeNotifier {
  bool _isLoadingOrders = false;

  bool get isLoadingOrders => _isLoadingOrders;

  bool _isLoadingFinishedOrders = true;

  bool get isLoadingFinishedOrders => _isLoadingFinishedOrders;

  List<DetailOrder> _allOrders = [];
  List<DetailOrder> _visibleOrders = [];

  List<DetailOrder> get orders => _visibleOrders;

  List<DetailOrder> finishOrders = [];
  int totalOrders = 0;
  double totalIncome = 0;

  String? _errorMessage;

  String? get errorMessage => _errorMessage;

  void _setError(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  Future<void> getListOrder(
    LoginResponse loginResponse, {
    int page = 1,
    int limit = Constants.maxLimit,
  }) async {
    _isLoadingOrders = true;
    _errorMessage = null;
    notifyListeners();

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

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> orderData = data['data']?['data'] ?? [];

        _allOrders = orderData
            .map((e) => DetailOrder.fromJson(Map<String, dynamic>.from(e)))
            .where((order) {
              final isFinished = order.status == ShippingStatus.FINISHED;
              return !isFinished;
            })
            .toList();

        _visibleOrders = _allOrders.take(5).toList();
      } else {
        _allOrders = [];
        _visibleOrders = [];
        _setError(AppStrings.error_loading_order_list);
      }
    } catch (e) {
      _allOrders = [];
      _visibleOrders = [];
      _setError('${AppStrings.connection_error}: $e');
    } finally {
      _isLoadingOrders = false;
      notifyListeners();
    }
  }

  Future<void> fetchFinishedOrdersToday(LoginResponse loginResponse) async {
    _isLoadingFinishedOrders = true;
    _errorMessage = null;
    notifyListeners();

    final now = DateTime.now();
    final tomorrow = now.add(const Duration(days: 1));

    final fromStr = DateFormat('yyyy-MM-dd').format(now);
    final toStr = DateFormat('yyyy-MM-dd').format(tomorrow);

    final url =
        "${Constants.shipperOrderUrl}${loginResponse.user.id}?status=FINISHED&from=$fromStr&to=$toStr&page=1&limit=${Constants.maxLimit}";
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${loginResponse.access}',
        },
      );

      if (response.statusCode == 200) {
        final responseJson = jsonDecode(response.body);
        final List<dynamic> dataList = responseJson['data']['data'] ?? [];

        final finishOrders = dataList
            .map((e) => DetailOrder.fromJson(Map<String, dynamic>.from(e)))
            .toList();

        totalOrders = finishOrders.length;
        totalIncome = finishOrders.fold(
          0,
          (sum, order) => sum + (order.order.shippingCost).toDouble(),
        );
      } else {
        finishOrders = [];
        totalOrders = 0;
        totalIncome = 0;
      }
    } catch (e) {
      finishOrders = [];
      totalOrders = 0;
      totalIncome = 0;
    } finally {
      _isLoadingFinishedOrders = false;
      notifyListeners();
    }
  }

  bool _isCompletingOrder = false;

  bool get isCompletingOrder => _isCompletingOrder;

  Future<bool> completeOrder(
    LoginResponse loginResponse,
    DetailOrder order,
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
          "orderId": order.order.id,
          "status": "FINISHED",
          "shipperId": loginResponse.user.id.toString(),
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

  String formatCurrency(double value) =>
      "${NumberFormat.decimalPattern('vi').format(value)}đ";
}
