import 'dart:typed_data';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:vietmap_flutter_gl/vietmap_flutter_gl.dart';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/constants/Constants.dart';
import 'package:express_mail/resources/colors.dart';

class PreviewMapBottomSheet extends StatefulWidget {
  final String geometry;
  final List<ShippingOrder> orders;
  final bool isDelivery;

  const PreviewMapBottomSheet({
    super.key,
    required this.geometry,
    required this.orders,
    required this.isDelivery,
  });

  @override
  State<PreviewMapBottomSheet> createState() => _PreviewMapBottomSheetState();
}

class _PreviewMapBottomSheetState extends State<PreviewMapBottomSheet> {
  VietmapController? _mapController;
  List<LatLng> routePoints = [];
  List<LatLng> orderPoints = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _decodePolyline(widget.geometry);
    _extractOrderPoints();
  }

  void _decodePolyline(String encoded) {
    List<LatLng> points = [];
    int index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.add(LatLng(lat / 1e5, lng / 1e5));
    }

    routePoints = points;
  }

  void _extractOrderPoints() {
    orderPoints.clear();
    for (var o in widget.orders) {
      double? lat;
      double? lng;
      if (widget.isDelivery) {
        if (o.receiverCoordinate.isEmpty) continue;
        final parts = o.receiverCoordinate.split(',');
        if (parts.length != 2) continue;
        lat = double.tryParse(parts[0].trim());
        lng = double.tryParse(parts[1].trim());
      } else {
        final latStr = o.shopProfile.latitude.trim();
        final lngStr = o.shopProfile.longitude.trim();
        lat = double.tryParse(latStr);
        lng = double.tryParse(lngStr);
      }
      if (lat != null && lng != null) {
        orderPoints.add(LatLng(lat, lng));
      }
    }
  }


  Future<Uint8List> _loadMarkerIcon(String path) async {
    ByteData data = await rootBundle.load(path);
    return data.buffer.asUint8List();
  }

  Future<void> _drawRouteAndMarkers() async {
    if (_mapController == null || routePoints.isEmpty) return;

    await _mapController!.clearLines();
    await _mapController!.clearSymbols();

    await _mapController!.addPolyline(
      PolylineOptions(
        geometry: routePoints,
        polylineColor: const Color(0xFF0680F9),
        polylineWidth: 6,
      ),
    );

    if (orderPoints.isNotEmpty) {
      final icon = await _loadMarkerIcon('assets/images/ic_gps.png');
      await _mapController!.addImage('order_icon', icon);

      for (var p in orderPoints) {
        await _mapController!.addSymbol(
          SymbolOptions(geometry: p, iconImage: 'order_icon', iconSize: 4.0),
        );
      }
    }

    final south = routePoints
        .map((p) => p.latitude)
        .reduce((a, b) => a < b ? a : b);
    final north = routePoints
        .map((p) => p.latitude)
        .reduce((a, b) => a > b ? a : b);
    final west = routePoints
        .map((p) => p.longitude)
        .reduce((a, b) => a < b ? a : b);
    final east = routePoints
        .map((p) => p.longitude)
        .reduce((a, b) => a > b ? a : b);

    final bounds = LatLngBounds(
      southwest: LatLng(south, west),
      northeast: LatLng(north, east),
    );

    await _mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(
        bounds,
        left: 50,
        top: 50,
        right: 50,
        bottom: 50,
      ),
    );

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final initialPoint = routePoints.isNotEmpty
        ? routePoints.first
        : LatLng(16.431283, 108.136100);

    return DraggableScrollableSheet(
      expand: false,
      minChildSize: 0.7,
      initialChildSize: 0.9,
      maxChildSize: 0.95,
      builder: (_, controller) {
        return Stack(
          children: [
            Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                children: [
                  Container(
                    width: 40,
                    height: 5,
                    margin: const EdgeInsets.only(top: 10, bottom: 10),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade400,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const Text(
                    AppStrings.route_preview,
                    style: TextStyle(
                      fontSize: 18,
                      fontFamily: "Inter_bold",
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Expanded(
                    child: VietmapGL(
                      styleString:
                          'https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${Constants.keyMap}',
                      initialCameraPosition: CameraPosition(
                        target: initialPoint,
                        zoom: 14,
                      ),
                      gestureRecognizers:
                          <Factory<OneSequenceGestureRecognizer>>{
                            Factory<OneSequenceGestureRecognizer>(
                              () => EagerGestureRecognizer(),
                            ),
                          },
                      onMapCreated: (controller) async {
                        _mapController = controller;
                      },
                      onMapIdle: () async {
                        if (_isLoading) {
                          await _drawRouteAndMarkers();
                          setState(() => _isLoading = false);
                        }
                      },
                      myLocationEnabled: true,
                      myLocationTrackingMode: MyLocationTrackingMode.none,
                    ),
                  ),
                ],
              ),
            ),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  color: AppColors.blue_127AE2,
                ),
              ),
          ],
        );
      },
    );
  }
}
