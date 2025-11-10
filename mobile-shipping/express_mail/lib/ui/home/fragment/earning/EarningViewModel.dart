import 'dart:convert';
import 'package:express_mail/constants/Constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:express_mail/data/model/DetailOrder.dart';
import 'package:express_mail/data/model/LoginResponse.dart';

class EarningViewModel extends ChangeNotifier {
  bool isLoading = false;

  List<DetailOrder> finishOrders = [];
  double totalIncome = 0;
  int totalOrders = 0;

  ///Get Orders
  Future<void> fetchFinishedOrdersByRange(
    LoginResponse loginResponse, {
    required String rangeType,
  }) async {
    isLoading = true;
    notifyListeners();

    final now = DateTime.now();
    late DateTime from;
    late DateTime to;

    if (rangeType == "day") {
      from = DateTime(now.year, now.month, now.day, 0, 0, 0);
      to = DateTime(now.year, now.month, now.day, 23, 59, 59).add(const Duration(days: 1));
    } else if (rangeType == "week") {
      final monday = now.subtract(Duration(days: now.weekday - 1));
      final sunday = monday.add(const Duration(days: 6));
      from = DateTime(monday.year, monday.month, monday.day, 0, 0, 0);
      to = DateTime(sunday.year, sunday.month, sunday.day, 23, 59, 59).add(const Duration(days: 1));
    } else if (rangeType == "month") {
      from = DateTime(now.year, now.month, 1, 0, 0, 0);
      final nextMonth = (now.month == 12)
          ? DateTime(now.year + 1, 1, 1)
          : DateTime(now.year, now.month + 1, 1);
      to = nextMonth.subtract(const Duration(seconds: 1)).add(const Duration(days: 1));
    }

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

      if (response.statusCode != 200) {
        totalOrders = 0;
        totalIncome = 0;
        finishOrders = [];
        isLoading = false;
        notifyListeners();
        return;
      }

      final data = jsonDecode(response.body);
      final dataList = data['data']?['data'] ?? [];

      finishOrders = dataList
          .map<DetailOrder>(
            (e) => DetailOrder.fromJson(Map<String, dynamic>.from(e)),
          )
          .toList();

      totalOrders = data['data']?['meta']['total'];
      totalIncome = finishOrders.fold(
        0,
        (sum, order) => sum + (order.order.shippingCost).toDouble(),
      );
    } catch (e) {
      totalOrders = 0;
      totalIncome = 0;
      finishOrders = [];
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  String formatCurrency(double value) {
    return "${NumberFormat.decimalPattern('vi').format(value)}đ";
  }
}
