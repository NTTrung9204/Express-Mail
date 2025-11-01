import 'dart:convert';
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
        required int? page,
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
      final response = await http.get(Uri.parse(url), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${loginResponse.access}',
      });

      if (response.statusCode != 200) {
        final error = jsonDecode(response.body);
        errorMessage = error['message'] ?? '';
        setLoading(false);
        notifyListeners();
        return;
      }

      final dataList = jsonDecode(response.body)['data']?['data'] ?? [];
      final orders = dataList
          .map<DetailOrder>(
              (item) => DetailOrder.fromJson(Map<String, dynamic>.from(item)))
          .toList();

      switch (status) {
        case "PICKUP_REQUESTED":
          pickupTotalPages = jsonDecode(response.body)['data']?['meta']['totalPages'];
          pickupRequestCount = jsonDecode(response.body)['data']?['meta']['total'];
          break;
        case "SHIPPING":
          shippingTotalPages = jsonDecode(response.body)['data']?['meta']['totalPages'];
          shippingCount = jsonDecode(response.body)['data']?['meta']['total'];
          break;
        case "RETURNING":
          returningTotalPages = jsonDecode(response.body)['data']?['meta']['totalPages'];
          returningCount = jsonDecode(response.body)['data']?['meta']['total'];
          break;
        default:
          allTotalPages = jsonDecode(response.body)['data']?['meta']['totalPages'];
          allCount = jsonDecode(response.body)['data']?['meta']['total'];
          break;
      }
      onSuccess(orders);
    } catch (e) {
      errorMessage = '${AppStrings.connection_error}: $e';
    } finally {
      setLoading(false);
      notifyListeners();
    }
  }

  // --- Fetch Pickup Request Orders ---
  Future<void> fetchPickupRequestOrders(LoginResponse loginResponse, {int page = 1}) async {
    await fetchOrders(
      loginResponse,
      status: "PICKUP_REQUESTED",
      page: page,
      onSuccess: (orders) => pickupRequestOrders = orders,
      setLoading: (loading) => isLoadingPickupRequest = loading,
    );
  }

  // --- Fetch Shipping Orders ---
  Future<void> fetchShippingOrders(LoginResponse loginResponse, {int page = 1}) async {
    await fetchOrders(
      loginResponse,
      status: "SHIPPING",
      page: page,
      onSuccess: (orders) => shippingOrders = orders,
      setLoading: (loading) => isLoadingShipping = loading,
    );
  }

  // --- Fetch Returning Orders ---
  Future<void> fetchReturningOrders(LoginResponse loginResponse, {int page = 1}) async {
    await fetchOrders(
      loginResponse,
      status: "RETURNING",
      page: page,
      onSuccess: (orders) => returningOrders = orders,
      setLoading: (loading) => isLoadingReturning = loading,
    );
  }

  // --- Fetch All Orders ---
  Future<void> fetchAllOrders(LoginResponse loginResponse, {int page = 1}) async {
    await fetchOrders(
      loginResponse,
      status: null,
      page: page,
      onSuccess: (orders) => allOrders = orders,
      setLoading: (loading) => isLoadingAll = loading,
    );
  }
}
