import 'dart:async';
import 'dart:ffi';
import 'dart:typed_data';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:vietmap_flutter_gl/vietmap_flutter_gl.dart';
import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/ui/map/MapViewModel.dart';

class MapActivity extends StatefulWidget {
  final ShippingOrder order;
  final bool isDelivery;

  const MapActivity({super.key, required this.order, this.isDelivery = false});

  @override
  State<MapActivity> createState() => _MapActivityState();
}

class _MapActivityState extends State<MapActivity> {
  late final MapViewModel viewModel;
  VietmapController? _mapController;
  LatLng? _currentLocation;
  LatLng? _location;
  StreamSubscription<LatLng>? _locationSub;

  final apiKey = Constants.keyMap;

  @override
  void initState() {
    super.initState();

    viewModel = MapViewModel();
    viewModel.addListener(() {
      if (!mounted) return;
      setState(() {});

      if (viewModel.errorMessage != null) {
        _showErrorDialog(viewModel.errorMessage!);
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => _initData());
  }

  @override
  void dispose() {
    _locationSub?.cancel();
    viewModel.dispose();
    super.dispose();
  }

  Future<Uint8List> _loadAsset(String path) async {
    ByteData data = await rootBundle.load(path);
    return data.buffer.asUint8List();
  }

  Future<void> _addMarkers() async {
    if (_mapController == null) return;

    final Uint8List startIcon = await _loadAsset("assets/images/ic_arrow.png");
    final Uint8List endIcon = await _loadAsset("assets/images/ic_gps.png");

    await _mapController!.addImage("start_icon", startIcon);
    await _mapController!.addImage("end_icon", endIcon);

    if (_currentLocation != null) {
      await _mapController!.addSymbol(
        SymbolOptions(
          geometry: _currentLocation!,
          iconImage: "start_icon",
          iconSize: 7,
        ),
      );
    }

    if (_location != null) {
      await _mapController!.addSymbol(
        SymbolOptions(geometry: _location!, iconImage: "end_icon", iconSize: 5),
      );
    }
  }

  Future<void> _drawRoute() async {
    if (_mapController == null) return;

    await _mapController!.clearSymbols();
    await _mapController!.clearLines();

    await _addMarkers();

    if (viewModel.routePoints.isNotEmpty) {
      await _mapController!.addPolyline(
        PolylineOptions(
          geometry: viewModel.routePoints,
          polylineColor: AppColors.blue_0680F9,
          polylineWidth: 7,
        ),
      );
    }
  }

  Future<void> _initData() async {
    _currentLocation = await viewModel.getCurrentLocation();
    if (_currentLocation == null) return;
    if (!widget.isDelivery) {
      final parts = widget.order.receiverCoordinate.split(',');
      if (parts.length == 2) {
        final lat = double.tryParse(parts[0].trim());
        final lng = double.tryParse(parts[1].trim());
        if (lat != null && lng != null) {
          _location = LatLng(lat, lng);
        }
      }
    } else {
      final latStr = widget.order.shopProfile.latitude;
      final lngStr = widget.order.shopProfile.longitude;

      if (latStr != null && lngStr != null) {
        final lat = double.parse(latStr);
        final lng = double.parse(lngStr);
        _location = LatLng(lat, lng);
      }
    }

    if (_location == null) return;

    await viewModel.fetchRoute(
      origin: _currentLocation!,
      destination: _location!,
    );

    if (_mapController != null) {
      await _drawRoute();
    }

    viewModel.startLocationStream(milliseconds: 2000);
    _locationSub = viewModel.currentLocationStream.listen((newLoc) async {
      _currentLocation = newLoc;
      if (_mapController != null) {
        await _drawRoute();
      }
    });
  }

  void _showErrorDialog(String message) {
    if (!mounted) return;

    showDialog(
      context: context,
      builder: (dialogContext) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.gray_E0E5EB, width: 1),
        ),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message,
                style: const TextStyle(
                  fontFamily: "Inter_regular",
                  fontSize: 15,
                  color: AppColors.black_1D2530,
                ),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.blue_0680F9,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                  ),
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text(
                    AppStrings.ok,
                    style: TextStyle(fontFamily: "Inter_bold", fontSize: 15),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Icon _getManeuverIcon(String stepText) {
    final text = stepText.toLowerCase();
    if (text.contains("rẽ trái")) {
      return const Icon(Icons.turn_left, color: Colors.white);
    } else if (text.contains("rẽ phải")) {
      return const Icon(Icons.turn_right, color: Colors.white);
    } else if (text.contains("tiếp tục") || text.contains("thẳng")) {
      return const Icon(Icons.arrow_upward, color: Colors.white);
    }
    return const Icon(Icons.arrow_upward, color: Colors.white);
  }

  @override
  Widget build(BuildContext context) {
    final model = viewModel;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppStrings.directions_map,
          style: TextStyle(
            fontFamily: "Inter_regular",
            color: AppColors.black,
            fontSize: 18,
          ),
        ),
      ),
      body: Stack(
        children: [
          VietmapGL(
            styleString:
                'https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=$apiKey',
            initialCameraPosition: CameraPosition(
              target: _currentLocation ?? LatLng(10.776, 106.700),
              zoom: 17,
            ),
            onMapCreated: (controller) async {
              _mapController = controller;
              await _addMarkers();
              if (!model.isLoading && model.routePoints.isNotEmpty) {
                await _drawRoute();
              }
            },
            myLocationEnabled: true,
            myLocationTrackingMode: MyLocationTrackingMode.trackingGps,
          ),

          if (model.isLoading) const Center(child: CircularProgressIndicator()),

          if (!model.isLoading && model.instructions.isNotEmpty)
            Positioned(
              top: 55,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 20,
                ),
                decoration: BoxDecoration(
                  color: AppColors.green_22C35D,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    _getManeuverIcon(model.instructions.first),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        model.instructions.first,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontFamily: "Inter_regular",
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          if (!model.isLoading && model.routePoints.isNotEmpty)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(
                  vertical: 25,
                  horizontal: 25,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "${AppStrings.estimated_time_remaining} ${formatDuration(model.estimatedTime! ~/ 60)}",
                            style: TextStyle(
                              fontSize: 18,
                              fontFamily: "Inter_regular",
                              color: AppColors.green_22C35D,
                            ),
                            softWrap: true,
                          ),
                          SizedBox(height: 16),
                          Text(
                            "${(model.distance! / 1000).toStringAsFixed(1)} ${AppStrings.km}",
                            style: TextStyle(
                              fontSize: 14,
                              fontFamily: "Inter_regular",
                              color: Colors.grey,
                            ),
                            softWrap: true,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  String formatDuration(int minutes) {
    if (minutes < 60) {
      return "$minutes ${AppStrings.minute}";
    } else if (minutes < 60 * 24) {
      final hours = minutes ~/ 60;
      final remMinutes = minutes % 60;
      return "$hours ${AppStrings.hours}${remMinutes > 0 ? " $remMinutes ${AppStrings.minute}" : ""}";
    } else {
      final days = minutes ~/ (60 * 24);
      final remHours = (minutes % (60 * 24)) ~/ 60;
      return "$days ${AppStrings.date}${remHours > 0 ? " $remHours ${AppStrings.hours}" : ""}";
    }
  }
}
