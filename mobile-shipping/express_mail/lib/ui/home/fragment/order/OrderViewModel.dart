import 'dart:convert';
import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/resources/strings.dart';

class OrderViewModel extends ChangeNotifier {
  // --- Loading states ---
  bool isLoadingPickupRequest = false;
  bool isLoadingShipping = false;
  bool isLoadingReturning = false;
  bool isLoadingAll = false;

  bool _isCompletingOrder = false;

  bool get isCompletingOrder => _isCompletingOrder;

  // --- Error message ---
  String? errorMessage;

  // --- Order lists ---
  List<DetailOrder> pickupRequestOrders = [];
  List<DetailOrder> shippingOrders = [];
  List<DetailOrder> returningOrders = [];
  List<DetailOrder> allOrders = [];

  int pickupRequestCount = 0;
  int shippingCount = 0;
  int returningCount = 0;
  int allCount = 0;

  int allTotalPages = 1;
  int pickupTotalPages = 1;
  int shippingTotalPages = 1;
  int returningTotalPages = 1;

  // --- Fetch Orders General ---
  Future<void> fetchOrders(
    LoginResponse loginResponse, {
    required String? status,
    required int page,
    required ValueSetter<List<DetailOrder>> onSuccess,
    required ValueSetter<bool> setLoading,
  }) async {
    setLoading(true);
    errorMessage = null;
    notifyListeners();

    String url = '${Constants.shipperOrderUrl}${loginResponse.user.id}?';
    if (status != null) url += 'status=$status&';
    url += 'page=$page&limit=${Constants.limit}';
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
        errorMessage = error['message'] ?? '';
        setLoading(false);
        notifyListeners();
        return;
      }

      final meta = jsonDecode(response.body)['data']?['meta'];
      switch (status) {
        case "PICKUP_REQUESTED":
          pickupTotalPages = meta['totalPages'] ?? 1;
          pickupRequestCount = meta['total'] ?? 0;
          break;
        case "SHIPPING":
          shippingTotalPages = meta['totalPages'] ?? 1;
          shippingCount = meta['total'] ?? 0;
          break;
        case "RETURNING":
          returningTotalPages = meta['totalPages'] ?? 1;
          returningCount = meta['total'] ?? 0;
          break;
        default:
          allTotalPages = meta['totalPages'] ?? 1;
          allCount = meta['total'] ?? 0;
          break;
      }

      final dataList = jsonDecode(response.body)['data']?['data'] ?? [];

      List<DetailOrder> orders = dataList
          .map<DetailOrder>(
            (item) => DetailOrder.fromJson(Map<String, dynamic>.from(item)),
          )
          .toList();
      orders = orders
          .where((order) => order.status != ShippingStatus.FINISHED)
          .toList();

      if (status == null) {
        allCount = orders.length;
        allTotalPages = (allCount / Constants.limit).ceil();
      }

      print("SSSS ${allCount} ${allTotalPages}");

      onSuccess(orders);
    } catch (e) {
      errorMessage = '${AppStrings.connection_error}: $e';
    } finally {
      setLoading(false);
      notifyListeners();
    }
  }

  // --- Fetch Orders by status ---
  Future<void> fetchPickupRequestOrders(
    LoginResponse loginResponse, {
    int page = 1,
  }) async {
    await fetchOrders(
      loginResponse,
      status: "PICKUP_REQUESTED",
      page: page,
      onSuccess: (orders) => pickupRequestOrders = orders,
      setLoading: (loading) => isLoadingPickupRequest = loading,
    );
  }

  Future<void> fetchShippingOrders(
    LoginResponse loginResponse, {
    int page = 1,
  }) async {
    await fetchOrders(
      loginResponse,
      status: "SHIPPING",
      page: page,
      onSuccess: (orders) => shippingOrders = orders,
      setLoading: (loading) => isLoadingShipping = loading,
    );
  }

  Future<void> fetchReturningOrders(
    LoginResponse loginResponse, {
    int page = 1,
  }) async {
    await fetchOrders(
      loginResponse,
      status: "RETURNING",
      page: page,
      onSuccess: (orders) => returningOrders = orders,
      setLoading: (loading) => isLoadingReturning = loading,
    );
  }

  Future<void> fetchAllOrders(
    LoginResponse loginResponse, {
    int page = 1,
  }) async {
    await fetchOrders(
      loginResponse,
      status: null,
      page: page,
      onSuccess: (orders) => allOrders = orders,
      setLoading: (loading) => isLoadingAll = loading,
    );
  }

  // --- Complete order by orderId ---
  Future<bool> completeOrderById(
    LoginResponse loginResponse,
    int orderId,
    int pageAll,
    int pagePickup,
    int pageShipping,
    int pageReturn,
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
          "orderId": orderId,
          "status": "FINISHED",
          "shipperId": loginResponse.user.id.toString(),
        }),
      );

      if (response.statusCode == 201) {
        await Future.wait([
          fetchAllOrders(loginResponse, page: pageAll),
          fetchPickupRequestOrders(loginResponse, page: pagePickup),
          fetchShippingOrders(loginResponse, page: pageShipping),
          fetchReturningOrders(loginResponse, page: pageReturn),
        ]);

        notifyListeners();
        return true;
      } else {
        return false;
      }
    } catch (_) {
      return false;
    } finally {
      _isCompletingOrder = false;
      notifyListeners();
    }
  }
}
