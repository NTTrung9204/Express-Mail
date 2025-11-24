import 'dart:convert';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:intl/intl.dart';

class HomeFragmentViewModel extends ChangeNotifier {
  bool _isLoadingOrdersPickup = false;

  bool get isLoadingOrdersPickup => _isLoadingOrdersPickup;

  bool _isLoadingOrdersDelivery = false;

  bool get isLoadingOrdersDelivery => _isLoadingOrdersDelivery;

  bool _isLoadingFinishedOrders = true;

  bool get isLoadingFinishedOrders => _isLoadingFinishedOrders;

  List<ShippingOrder> _allOrdersPickup = [];
  List<ShippingOrder> _visibleOrdersPickup = [];

  List<ShippingOrder> get ordersPickup => _visibleOrdersPickup;

  List<ShippingOrder> _allOrdersDelivery = [];
  List<ShippingOrder> _visibleOrdersDelivery = [];

  List<ShippingOrder> get ordersDelivery => _visibleOrdersDelivery;

  List<DetailOrder> finishOrders = [];
  int totalOrders = 0;
  double totalIncome = 0;

  String? _errorMessagePickup;

  String? get errorMessagePickup => _errorMessagePickup;

  String? _errorMessageDelivery;

  String? get errorMessageDelivery => _errorMessageDelivery;

  String? _errorMessageFinish;

  String? get errorMessageFinish => _errorMessageFinish;

  void _setErrorPickup(String message) {
    _errorMessagePickup = message;
    notifyListeners();
  }

  void _setErrorDelivery(String message) {
    _errorMessageDelivery = message;
    notifyListeners();
  }

  Future<void> getListOrderPickup(LoginResponse loginResponse) async {
    _isLoadingOrdersPickup = true;
    _errorMessagePickup = null;
    notifyListeners();

    final now = DateTime.now();
    final tomorrow = now.add(const Duration(days: 1));

    final fromStr = DateFormat('yyyy-MM-dd').format(now);
    final toStr = DateFormat('yyyy-MM-dd').format(tomorrow);

    final url =
        '${Constants.baseUrlTrung}/plan/shipping-plan?shipper_id=${loginResponse.user.id}&mode=pickup&start_date=${fromStr}&end_date=${toStr}';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${loginResponse.access}',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List<dynamic>;

        List<ShippingOrder> lastBatchOrders = [];
        for (int i = data.length - 1; i >= 0; i--) {
          final batch = data[i];
          if (batch['orders'] != null && (batch['orders'] as List).isNotEmpty) {
            lastBatchOrders = (batch['orders'] as List)
                .map(
                  (e) => ShippingOrder.fromJson(Map<String, dynamic>.from(e)),
                )
                .where((order) {
                  final status = order.routeStep.status.toUpperCase();
                  return status != "FAILED" && status != "COMPLETED";
                })
                .toList();

            if (lastBatchOrders.isNotEmpty) {
              break;
            }
          }
        }

        _allOrdersPickup = lastBatchOrders;
        _visibleOrdersPickup = _allOrdersPickup.take(5).toList();
      } else {
        _allOrdersPickup = [];
        _visibleOrdersPickup = [];
        _setErrorPickup(AppStrings.error_loading_order_list);
      }
    } catch (e) {
      _allOrdersPickup = [];
      _visibleOrdersPickup = [];
      _setErrorPickup('${AppStrings.connection_error}: $e');
    } finally {
      _isLoadingOrdersPickup = false;
      notifyListeners();
    }
  }

  Future<void> getListOrderDelivery(LoginResponse loginResponse) async {
    _isLoadingOrdersDelivery = true;
    _errorMessageDelivery = null;
    notifyListeners();

    final now = DateTime.now();
    final tomorrow = now.add(const Duration(days: 1));

    final fromStr = DateFormat('yyyy-MM-dd').format(now);
    final toStr = DateFormat('yyyy-MM-dd').format(tomorrow);

    final url =
        '${Constants.baseUrlTrung}/plan/shipping-plan?shipper_id=${loginResponse.user.id}&mode=delivery&start_date=${fromStr}&end_date=${toStr}';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${loginResponse.access}',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List<dynamic>;

        List<ShippingOrder> lastBatchOrders = [];
        for (int i = data.length - 1; i >= 0; i--) {
          final batch = data[i];
          if (batch['orders'] != null && (batch['orders'] as List).isNotEmpty) {
            lastBatchOrders = (batch['orders'] as List)
                .map(
                  (e) => ShippingOrder.fromJson(Map<String, dynamic>.from(e)),
                )
                .where((order) {
                  final status = order.routeStep.status.toUpperCase();
                  return status != "FAILED" && status != "COMPLETED";
                })
                .toList();

            if (lastBatchOrders.isNotEmpty) {
              break;
            }
          }
        }

        _allOrdersDelivery = lastBatchOrders;
        _visibleOrdersDelivery = _allOrdersDelivery.take(5).toList();
      } else {
        _allOrdersDelivery = [];
        _visibleOrdersDelivery = [];
        _setErrorDelivery(AppStrings.error_loading_order_list);
      }
    } catch (e) {
      _allOrdersDelivery = [];
      _visibleOrdersDelivery = [];
      _setErrorDelivery('${AppStrings.connection_error}: $e');
    } finally {
      _isLoadingOrdersDelivery = false;
      notifyListeners();
    }
  }

  Future<void> fetchFinishedOrdersToday(LoginResponse loginResponse) async {
    _isLoadingFinishedOrders = true;
    _errorMessageFinish = null;
    notifyListeners();

    final now = DateTime.now();
    late DateTime from;
    late DateTime to;

    from = DateTime(now.year, now.month, now.day, 0, 0, 0);
    to = DateTime(
      now.year,
      now.month,
      now.day,
      23,
      59,
      59,
    ).add(const Duration(days: 1));

    final fromStr = DateFormat('yyyy-MM-dd').format(from);
    final toStr = DateFormat('yyyy-MM-dd').format(to);
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
