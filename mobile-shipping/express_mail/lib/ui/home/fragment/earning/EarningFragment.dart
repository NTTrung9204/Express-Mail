import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shimmer/shimmer.dart';

import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/enum/ShippingStatus.dart';
import 'package:express_mail/ui/home/fragment/earning/EarningViewModel.dart';
import 'package:express_mail/ui/history/HistoryActivity.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:path_provider/path_provider.dart';

class EarningFragment extends StatefulWidget {
  final LoginResponse loginResponse;

  const EarningFragment({super.key, required this.loginResponse});

  @override
  State<EarningFragment> createState() => _EarningFragmentState();
}

class _EarningFragmentState extends State<EarningFragment> {
  late final EarningViewModel viewModel;
  String selectedTab = AppStrings.today;

  @override
  void initState() {
    super.initState();
    viewModel = EarningViewModel();
    _fetchData("day");
  }

  void _fetchData(String rangeType) {
    viewModel.fetchFinishedOrdersByRange(
      widget.loginResponse,
      rangeType: rangeType,
    );
  }

  @override
  void dispose() {
    viewModel.dispose();
    super.dispose();
  }

  Future<bool> _requestStoragePermission() async {
    if (Platform.isAndroid) {
      final sdk = (await _getAndroidSdkInt()) ?? 0;

      if (sdk >= 30) {
        return await Permission.manageExternalStorage.isGranted;
      } else {
        return await Permission.storage.isGranted;
      }
    }
    if (Platform.isIOS) {
      final status = await Permission.photosAddOnly.status;
      if (!status.isGranted) {
        final result = await Permission.photosAddOnly.request();
        return result.isGranted;
      }
      return true;
    }
    return false;
  }

  Future<int?> _getAndroidSdkInt() async {
    try {
      final String sdkStr = await MethodChannel(
        'android_sdk',
      ).invokeMethod('getSdkInt');
      return int.tryParse(sdkStr);
    } catch (_) {
      return null;
    }
  }

  Future<String?> _saveFileToDownloads(File file, String fileName) async {
    try {
      Directory directory;
      if (Platform.isAndroid) {
        final sdk = (await _getAndroidSdkInt()) ?? 0;
        if (sdk >= 30) {
          directory = Directory('/storage/emulated/0/Download');
        } else {
          directory = (await getExternalStorageDirectory())!;
        }
      } else {
        directory = await getApplicationDocumentsDirectory();
      }
      final path = '${directory.path}/$fileName';
      await file.copy(path);
      return path;
    } catch (e) {
      debugPrint("Error saving file: $e");
      return null;
    }
  }

  Future<void> _openAllFilesAccessSettings() async {
    if (Platform.isAndroid) {
      const platform = MethodChannel('android_sdk');
      try {
        await platform.invokeMethod('openAllFilesAccessSettings');
      } on PlatformException catch (e) {
        debugPrint("Failed to open settings: $e");
      }
    }
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppColors.white,
          title: const Text(
            AppStrings.request_access,
            style: TextStyle(
              fontFamily: "Inter_bold",
              fontSize: 16,
              color: AppColors.black,
            ),
          ),
          content: const Text(
            AppStrings
                .the_application_needs_storage_access_permission_to_save_files,
            style: TextStyle(
              fontFamily: "Inter_medium",
              fontSize: 14,
              color: AppColors.black,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                AppStrings.cancel,
                style: TextStyle(
                  fontFamily: "Inter_regular",
                  fontSize: 14,
                  color: AppColors.black,
                ),
              ),
            ),
            TextButton(
              onPressed: () async {
                Navigator.pop(context);
                await _openAllFilesAccessSettings();
              },
              child: Text(
                AppStrings.ok,
                style: TextStyle(
                  fontFamily: "Inter_regular",
                  fontSize: 14,
                  color: AppColors.blue_4591FF,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: viewModel,
      builder: (context, _) {
        return Scaffold(
          backgroundColor: AppColors.white_F8F7FC,
          body: SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                const SizedBox(height: 8),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                    child: _buildTransactions(),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.green_22C35D, AppColors.green_3CDD77],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.earning,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 23,
                      fontFamily: "Inter_bold",
                    ),
                  ),
                  Text(
                    AppStrings.track_your_earnings,
                    style: TextStyle(
                      color: AppColors.white_80,
                      fontSize: 15,
                      fontFamily: "Inter_regular",
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () async {
                  final granted = await _requestStoragePermission();
                  if (!granted) {
                    _showPermissionDialog();
                    return;
                  }

                  final file = await viewModel.exportToExcel();
                  if (file != null) {
                    final path = await _saveFileToDownloads(
                      file,
                      'Earning.xlsx',
                    );
                    if (path != null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            AppStrings.save_the_file_successfully,
                            style: TextStyle(
                              fontFamily: "Inter_regular",
                              fontSize: 14,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            AppStrings.unable_to_save_file,
                            style: TextStyle(
                              fontFamily: "Inter_regular",
                              fontSize: 14,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      );
                    }
                  }
                },
                icon: const Icon(Icons.download_outlined, size: 20),
                label: const Text(
                  AppStrings.export,
                  style: TextStyle(fontSize: 13, fontFamily: "Inter_regular"),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.white_10,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: AppColors.white_20),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 13,
                    vertical: 10,
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Tabs
          Row(
            children: [AppStrings.today, AppStrings.week, AppStrings.month].map(
              (label) {
                final isSelected = selectedTab == label;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: TextButton(
                    style: TextButton.styleFrom(
                      backgroundColor: isSelected
                          ? Colors.white
                          : AppColors.white_10,
                      foregroundColor: isSelected
                          ? AppColors.green_22C35D
                          : AppColors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 11,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: const BorderSide(
                          color: AppColors.white_20,
                          width: 1,
                        ),
                      ),
                    ),
                    onPressed: () {
                      setState(() => selectedTab = label);
                      String rangeType = label == AppStrings.week
                          ? "week"
                          : label == AppStrings.month
                          ? "month"
                          : "day";
                      _fetchData(rangeType);
                    },
                    child: Text(
                      label,
                      style: const TextStyle(
                        fontFamily: "Inter_regular",
                        fontSize: 13,
                      ),
                    ),
                  ),
                );
              },
            ).toList(),
          ),

          const SizedBox(height: 10),

          // Main Earnings
          Center(
            child: Column(
              children: [
                viewModel.isLoading
                    ? SizedBox(
                        height: 31,
                        child: Lottie.asset(
                          'assets/animation/ani_load.json',
                          fit: BoxFit.contain,
                          repeat: true,
                        ),
                      )
                    : Text(
                        viewModel.totalIncome > 0
                            ? "${NumberFormat.decimalPattern('vi').format(viewModel.totalIncome)}đ"
                            : "0đ",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontFamily: "Inter_bold",
                        ),
                      ),
                const SizedBox(height: 6),
                viewModel.isLoading
                    ? SizedBox(
                        height: 20,
                        child: Lottie.asset(
                          'assets/animation/ani_load.json',
                          fit: BoxFit.contain,
                          repeat: true,
                        ),
                      )
                    : Text(
                        "${viewModel.totalOrders} ${AppStrings.delivery_order}",
                        style: const TextStyle(
                          color: AppColors.white_80,
                          fontSize: 13,
                          fontFamily: "Inter_regular",
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactions() {
    final finishOrders = viewModel.finishOrders;

    return RefreshIndicator(
      color: Colors.blue,
      backgroundColor: Colors.white,
      strokeWidth: 2,
      displacement: 5,
      onRefresh: () async {
        String rangeType = selectedTab == AppStrings.week
            ? "week"
            : selectedTab == AppStrings.month
            ? "month"
            : "day";
        _fetchData(rangeType);
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gray_DADFE7, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(25),
        child: viewModel.isLoading
            ? _buildShimmerList()
            : finishOrders.isEmpty
            ? _buildNoData()
            : _buildOrderList(finishOrders),
      ),
    );
  }

  Widget _buildShimmerList() {
    return Shimmer.fromColors(
      baseColor: AppColors.gray_DADFE7,
      highlightColor: AppColors.white_F8F7FC,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(5, (_) => _transactionItemShimmer()),
      ),
    );
  }

  Widget _buildNoData() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 30),
            child: AspectRatio(
              aspectRatio: 1,
              child: Image.asset(
                "assets/images/img_no_data.webp",
                fit: BoxFit.contain,
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            AppStrings.no_order_data,
            style: TextStyle(color: Colors.black54, fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildOrderList(List finishOrders) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.history_outlined,
              size: 30,
              color: AppColors.blue_127AE2,
            ),
            const SizedBox(width: 8),
            Text(
              AppStrings.history_delivery,
              style: TextStyle(
                fontSize: 24,
                fontFamily: "Inter_bold",
                color: AppColors.blue_344256,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Expanded(
          child: ListView.separated(
            itemCount: finishOrders.length,
            separatorBuilder: (_, __) => const Divider(height: 8),
            itemBuilder: (_, index) {
              final order = finishOrders[index];
              return _transactionItem(
                "#${order.order.code}",
                "+${NumberFormat.decimalPattern('vi').format(order.order.shippingCost)}đ",
                order.order.lastShipping?.status.name ??
                    ShippingStatus.FINISHED.name,
                order.createdAt,
                order.order.lastShipping?.status.color ??
                    ShippingStatus.FINISHED.color,
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextButton(
                style: TextButton.styleFrom(
                  backgroundColor: AppColors.white_F8F7FC,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(color: AppColors.gray_EDEFF3, width: 1),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 11),
                ),
                onPressed: () {
                  String rangeType = selectedTab == AppStrings.week
                      ? "week"
                      : selectedTab == AppStrings.month
                      ? "month"
                      : "day";
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => HistoryActivity(
                        loginResponse: widget.loginResponse,
                        rangeType: rangeType,
                      ),
                    ),
                  );
                },
                child: const Text(
                  AppStrings.view_all,
                  style: TextStyle(
                    fontFamily: "Inter_regular",
                    fontSize: 13,
                    color: AppColors.blue_344256,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _transactionItemShimmer() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 80,
                height: 13,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 4),
              Container(
                width: 50,
                height: 11,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
          ),
          Container(
            width: 60,
            height: 14,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _transactionItem(
    String title,
    String amount,
    String status,
    String date,
    Color color,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(
          title,
          style: TextStyle(
            fontFamily: "Inter_regular",
            fontSize: 13,
            color: AppColors.blue_344256,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              status,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontFamily: "Inter_bold",
              ),
            ),
            const SizedBox(height: 8),
            Text(
              date,
              style: TextStyle(
                color: AppColors.gray_7B899D,
                fontSize: 11,
                fontFamily: "Inter_regular",
              ),
            ),
          ],
        ),
        trailing: Text(
          amount,
          style: TextStyle(
            color: AppColors.green_22C35D,
            fontFamily: "Inter_bold",
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
