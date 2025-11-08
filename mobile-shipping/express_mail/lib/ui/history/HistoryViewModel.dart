import 'dart:convert';
import 'package:express_mail/constants/Constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/DetailOrder.dart';

class HistoryViewModel extends ChangeNotifier {
  bool isLoading = false;
  bool isLoadingMore = false;
  bool hasMoreData = true;

  int currentPage = 1;
  int totalPage = 1;
  List<DetailOrder> histories = [];

  Future<void> fetchHistory(
    LoginResponse loginResponse, {
    bool loadMore = false,
    String rangeType = "day",
  }) async {
    if (isLoading || isLoadingMore) return;

    if (loadMore && (!hasMoreData || currentPage > totalPage)) return;

    if (loadMore) {
      isLoadingMore = true;
    } else {
      isLoading = true;
      currentPage = 1;
      totalPage = 1;
      histories.clear();
      hasMoreData = true;
    }
    notifyListeners();

    final now = DateTime.now();
    late DateTime from;
    late DateTime to;

    if (rangeType == "day") {
      from = DateTime(now.year, now.month, now.day, 0, 0, 0);
      to = DateTime(now.year, now.month, now.day, 23, 59, 59);
    } else if (rangeType == "week") {
      final monday = now.subtract(Duration(days: now.weekday - 1));
      final sunday = monday.add(const Duration(days: 6));
      from = DateTime(monday.year, monday.month, monday.day, 0, 0, 0);
      to = DateTime(sunday.year, sunday.month, sunday.day, 23, 59, 59);
    } else if (rangeType == "month") {
      from = DateTime(now.year, now.month, 1, 0, 0, 0);
      final nextMonth = (now.month == 12)
          ? DateTime(now.year + 1, 1, 1)
          : DateTime(now.year, now.month + 1, 1);
      to = nextMonth.subtract(const Duration(seconds: 1));
    }

    final fromStr = DateFormat('yyyy-MM-dd').format(from);
    final toStr = DateFormat('yyyy-MM-dd').format(to);

    // final url =
    //     "${Constants.shipperOrderUrl}${loginResponse.user.id}?status=FINISHED&from=$fromStr&to=$toStr&page=1&limit=100";
    final url =
        "${Constants.shipperOrderUrl}${loginResponse.user.id}?page=$currentPage&limit=${Constants.limit}";

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${loginResponse.access}',
        },
      );

      if (response.statusCode != 200) {
        hasMoreData = false;
        return;
      }

      final data = jsonDecode(response.body);
      final dataList = data['data']?['data'] ?? [];
      totalPage = data['data']?['meta']?['totalPages'] ?? 1;

      final fetched = dataList
          .map<DetailOrder>(
            (e) => DetailOrder.fromJson(Map<String, dynamic>.from(e)),
          )
          .toList();

      if (loadMore) {
        histories.addAll(fetched);
      } else {
        histories = fetched;
      }
      if (currentPage < totalPage && fetched.isNotEmpty) {
        currentPage++;
        hasMoreData = true;
      } else {
        hasMoreData = false;
      }
    } catch (e) {
      debugPrint("${e}");
    } finally {
      isLoading = false;
      isLoadingMore = false;
      notifyListeners();
    }
  }
}
