import 'dart:convert';
import 'package:express_mail/constants/Constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/DetailOrder.dart';

class HistoryViewModel extends ChangeNotifier {
  bool isLoading = false;

  List<DetailOrder> histories = [];

  Future<void> fetchHistory(
      LoginResponse loginResponse, {
        String rangeType = "day",
        DateTime? fromDate,
        DateTime? toDate,
      }) async {
    isLoading = true;
    notifyListeners();

    final now = DateTime.now();
    late DateTime from;
    late DateTime to;

    if (fromDate != null && toDate != null) {
      from = DateTime(fromDate.year, fromDate.month, fromDate.day, 0, 0, 0);
      to = DateTime(toDate.year, toDate.month, toDate.day, 23, 59, 59).add(const Duration(days: 1));
    } else {
      if (rangeType == "day") {
        from = DateTime(now.year, now.month, now.day, 0, 0, 0);
        to = DateTime(now.year, now.month, now.day, 23, 59, 59).add(const Duration(days: 1));
      } else if (rangeType == "week") {
        final monday = now.subtract(Duration(days: now.weekday - 1));
        from = DateTime(monday.year, monday.month, monday.day, 0, 0, 0);
        to = now.add(const Duration(days: 1));
      } else if (rangeType == "month") {
        from = DateTime(now.year, now.month, 1, 0, 0, 0);
        to = now.add(const Duration(days: 1));
      }
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
        return;
      }

      final data = jsonDecode(response.body);
      final dataList = data['data']?['data'] ?? [];

      final fetched = dataList
          .map<DetailOrder>(
            (e) => DetailOrder.fromJson(Map<String, dynamic>.from(e)),
          )
          .toList();
      histories = fetched;
    } catch (e) {
      debugPrint("${e}");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
