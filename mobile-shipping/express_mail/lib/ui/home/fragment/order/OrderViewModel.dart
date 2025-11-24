import 'dart:convert';
import 'package:express_mail/data/model/ShippingPlan.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/resources/strings.dart';

class OrderViewModel extends ChangeNotifier {
  bool _isLoadingOrdersPickup = false;

  bool get isLoadingOrdersPickup => _isLoadingOrdersPickup;

  bool _isLoadingOrdersDelivery = false;

  bool get isLoadingOrdersDelivery => _isLoadingOrdersDelivery;

  List<ShippingPlan> _allOrdersPickup = [];

  List<ShippingPlan> get ordersPickup => _allOrdersPickup;

  List<ShippingPlan> _allOrdersDelivery = [];

  List<ShippingPlan> get ordersDelivery => _allOrdersDelivery;

  String? _errorMessagePickup;

  String? get errorMessagePickup => _errorMessagePickup;

  String? _errorMessageDelivery;

  String? get errorMessageDelivery => _errorMessageDelivery;

  void _setErrorPickup(String message) {
    _errorMessagePickup = message;
    notifyListeners();
  }

  void _setErrorDelivery(String message) {
    _errorMessageDelivery = message;
    notifyListeners();
  }

  Future<void> getListOrderPickup(
    LoginResponse loginResponse,
    String fromStr,
    String toStr,
  ) async {
    _isLoadingOrdersPickup = true;
    _errorMessagePickup = null;
    notifyListeners();

    final url =
        '${Constants.baseUrlTrung}/plan/shipping-plan?shipper_id=${loginResponse.user.id}&mode=pickup&start_date=$fromStr&end_date=$toStr';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${loginResponse.access}',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        List<ShippingPlan> allPlans = [];

        for (var batch in data) {
          final plan = ShippingPlan.fromJson(Map<String, dynamic>.from(batch));

          final filteredOrders = plan.orders.where((order) {
            final status = order.routeStep.status.toUpperCase();
            return status != 'FAILED' && status != 'COMPLETED';
          }).toList();

          if (filteredOrders.isNotEmpty) {
            allPlans.add(
              ShippingPlan(
                orders: filteredOrders,
                geometry: plan.geometry,
                mode: plan.mode,
                distance: plan.distance,
                duration: plan.duration,
                time: plan.time,
              ),
            );
          }
        }
        _allOrdersPickup = allPlans;
      } else {
        _allOrdersPickup = [];
        _setErrorPickup(AppStrings.error_loading_order_list);
      }
    } catch (e) {
      _allOrdersPickup = [];
      _setErrorPickup('${AppStrings.connection_error}: $e');
    } finally {
      _isLoadingOrdersPickup = false;
      notifyListeners();
    }
  }

  Future<void> getListOrderDelivery(
    LoginResponse loginResponse,
    String fromStr,
    String toStr,
  ) async {
    _isLoadingOrdersDelivery = true;
    _errorMessageDelivery = null;
    notifyListeners();

    final url =
        '${Constants.baseUrlTrung}/plan/shipping-plan?shipper_id=${loginResponse.user.id}&mode=delivery&start_date=$fromStr&end_date=$toStr';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${loginResponse.access}',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        List<ShippingPlan> allPlans = [];

        for (var batch in data) {
          final plan = ShippingPlan.fromJson(Map<String, dynamic>.from(batch));

          final filteredOrders = plan.orders.where((order) {
            final status = order.routeStep.status.toUpperCase();
            return status != 'FAILED' && status != 'COMPLETED';
          }).toList();

          if (filteredOrders.isNotEmpty) {
            allPlans.add(
              ShippingPlan(
                orders: filteredOrders,
                geometry: plan.geometry,
                mode: plan.mode,
                time: plan.time,
                distance: plan.distance,
                duration: plan.duration,
              ),
            );
          }
        }
        _allOrdersDelivery = allPlans;
      } else {
        _allOrdersDelivery = [];
        _setErrorDelivery(AppStrings.error_loading_order_list);
      }
    } catch (e) {
      _allOrdersDelivery = [];
      _setErrorDelivery('${AppStrings.connection_error}: $e');
    } finally {
      _isLoadingOrdersDelivery = false;
      notifyListeners();
    }
  }
}
