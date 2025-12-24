import 'package:express_mail/resources/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:vietmap_flutter_gl/vietmap_flutter_gl.dart';
import 'dart:typed_data';
import 'package:express_mail/constants/Constants.dart';

class MapFragment extends StatefulWidget {
  const MapFragment({super.key});

  @override
  State<MapFragment> createState() => _MapFragmentState();
}

class _MapFragmentState extends State<MapFragment> {
  VietmapController? _controller;

  final List<LatLng> points = [
    LatLng(16.431283, 108.136100),
    LatLng(16.434649, 108.632716),
    LatLng(16.436443, 108.629391),
    LatLng(16.431283, 108.136100),
  ];

  final List<String> types = ["start", "job", "job", "end"];

  final String geometry =
      "mfhcByx}oSGCQKwAlCsBtCgA|A}@lAm@x@_BxBqBnCg@r@iA~AoAbBcArAiClDy@hA{@rAc@|@Yr@iBlEPHbCaGtAj@uAk@|AoCv@gAjCmD|FaIdA{ArCwDl@{@xFaIxAmCFB";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Bản đồ")),
      body: VietmapGL(
        styleString:
        "https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${Constants.keyMap}",
        initialCameraPosition: CameraPosition(
          target: points[0],
          zoom: 14.0,
        ),
        myLocationEnabled: true,
        myLocationTrackingMode: MyLocationTrackingMode.trackingGps,
        onMapCreated: _onMapCreated,
      ),
    );
  }

  Future<void> _onMapCreated(VietmapController controller) async {
    _controller = controller;

    // Chờ map render xong
    await Future.delayed(const Duration(milliseconds: 3000));

    // Load icon marker
    final Uint8List startIcon = await _loadAsset("assets/images/ic_arrow.png");
    final Uint8List jobIcon = await _loadAsset("assets/images/ic_arrow.png");
    final Uint8List endIcon = await _loadAsset("assets/images/ic_arrow.png");

    await _controller!.addImage("start_icon", startIcon);
    await _controller!.addImage("job_icon", jobIcon);
    await _controller!.addImage("end_icon", endIcon);

    // Decode polyline
    final routePoints = _decodePolyline(geometry);

    // Vẽ polyline toàn tuyến
    if (routePoints.isNotEmpty) {
      await _controller!.addPolyline(
        PolylineOptions(
          geometry: routePoints,
          polylineColor: AppColors.blue_0680F9,
          polylineWidth: 5.0,
        ),
      );
    }

    // Lấy 5 điểm mẫu từ tuyến để thêm marker
    final samplePoints = _getSamplePoints(routePoints, 5);

    for (int i = 0; i < samplePoints.length; i++) {
      String iconName = (i == 0)
          ? "start_icon"
          : (i == samplePoints.length - 1)
          ? "end_icon"
          : "job_icon";

      await _controller!.addSymbol(
        SymbolOptions(
          geometry: samplePoints[i],
          iconImage: iconName,
          iconSize: 10,
          draggable: false,
        ),
      );
    }

    // Zoom camera theo 2 điểm đầu/cuối của tuyến
    if (samplePoints.isNotEmpty) {
      await _zoomToBounds([samplePoints.first, samplePoints.last]);
    }
  }

  Future<Uint8List> _loadAsset(String path) async {
    ByteData data = await rootBundle.load(path);
    return data.buffer.asUint8List();
  }

  List<LatLng> _decodePolyline(String encoded) {
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

    return points;
  }

  // Lấy N điểm mẫu từ tuyến
  List<LatLng> _getSamplePoints(List<LatLng> routePoints, int count) {
    if (routePoints.isEmpty || count <= 0) return [];

    int step = (routePoints.length / (count - 1)).floor();
    List<LatLng> samplePoints = [];

    for (int i = 0; i < routePoints.length && samplePoints.length < count; i += step) {
      samplePoints.add(routePoints[i]);
    }

    if (!samplePoints.contains(routePoints.last)) {
      samplePoints.add(routePoints.last);
    }

    return samplePoints;
  }

  Future<void> _zoomToBounds(List<LatLng> pointsToZoom) async {
    if (_controller == null || pointsToZoom.isEmpty) return;

    double minLat =
    pointsToZoom.map((p) => p.latitude).reduce((a, b) => a < b ? a : b);
    double maxLat =
    pointsToZoom.map((p) => p.latitude).reduce((a, b) => a > b ? a : b);
    double minLng =
    pointsToZoom.map((p) => p.longitude).reduce((a, b) => a < b ? a : b);
    double maxLng =
    pointsToZoom.map((p) => p.longitude).reduce((a, b) => a > b ? a : b);

    await _controller!.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat, minLng),
          northeast: LatLng(maxLat, maxLng),
        ),
      ),
    );
  }
}
