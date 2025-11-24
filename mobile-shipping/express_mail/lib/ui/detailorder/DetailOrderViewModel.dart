import 'dart:async';
import 'dart:convert';
import 'package:express_mail/data/model/LoginResponse.dart';
import 'package:express_mail/data/model/ShippingOrder.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:vietmap_flutter_gl/vietmap_flutter_gl.dart';
import 'package:express_mail/constants/Constants.dart';

class DetailOrderViewModel extends ChangeNotifier {
  final ShippingOrder detailOrder;
  final bool isDelivery;

  double distance = 0;
  int estimated = 0;
  bool loading = true;
  String? error;

  LatLng? _currentLocation;
  final StreamController<LatLng> _locationController =
      StreamController.broadcast();
  StreamSubscription<LatLng>? _positionSub;

  Stream<LatLng> get currentLocationStream => _locationController.stream;

  LatLng? get currentLocation => _currentLocation;

  DetailOrderViewModel({required this.detailOrder, required this.isDelivery}) {
    fetchDistanceAndTime();
  }

  Future<void> fetchDistanceAndTime() async {
    loading = true;
    error = null;
    notifyListeners();

    await _fetchDistanceInternal();

    loading = false;
    notifyListeners();
  }

  Future<void> updateDistanceAndTime() async {
    try {
      await _fetchDistanceInternal();
      loading = false;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> _fetchDistanceInternal() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      _currentLocation = LatLng(position.latitude, position.longitude);

      double destLat;
      double destLng;

      if (isDelivery) {
        final parts = detailOrder.receiverCoordinate.split(',');
        if (parts.length != 2) {
          throw Exception("Invalid receiver coordinate format");
        }
        destLat =
            double.tryParse(parts[0].trim()) ??
            (throw Exception("Invalid receiver latitude"));
        destLng =
            double.tryParse(parts[1].trim()) ??
            (throw Exception("Invalid receiver longitude"));
      } else {
        destLat =
            double.tryParse(detailOrder.shopProfile.latitude.trim()) ??
            (throw Exception("Invalid shop latitude"));
        destLng =
            double.tryParse(detailOrder.shopProfile.longitude.trim()) ??
            (throw Exception("Invalid shop longitude"));
      }

      final apiKey = Constants.keyMap;
      final url =
          'https://maps.vietmap.vn/api/route?api-version=1.1&apikey=$apiKey'
          '&point=${_currentLocation!.latitude},${_currentLocation!.longitude}'
          '&point=$destLat,$destLng'
          '&vehicle=motorcycle';

      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200)
        throw Exception("HTTP ${response.statusCode}");

      final data = jsonDecode(response.body);
      final path = data['paths']?[0];
      if (path == null) throw Exception("No route data");

      distance = (path['distance'] as num?)?.toDouble() ?? 0;
      final timeMs = (path['time'] as num?)?.toInt() ?? 0;
      estimated = (timeMs / 1000).toInt();
    } catch (e) {
      distance = 0;
      estimated = 0;
      error = e.toString();
    }
  }

  void startLocationStream({int milliseconds = 2000}) async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      error = AppStrings.location_access_is_not_enabled_on_the_device;
      notifyListeners();
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        error = AppStrings.location_access_denied;
        notifyListeners();
        return;
      }
    }
    if (permission == LocationPermission.deniedForever) {
      error = AppStrings.location_access_denied;
      notifyListeners();
      return;
    }

    _positionSub?.cancel();
    _positionSub = Stream.periodic(Duration(milliseconds: milliseconds))
        .asyncMap((_) async {
          final pos = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.high,
          );
          return LatLng(pos.latitude, pos.longitude);
        })
        .listen((latLng) {
          _currentLocation = latLng;
          _locationController.add(latLng);
          notifyListeners();
        });
  }

  void stopLocationStream() {
    _positionSub?.cancel();
    _positionSub = null;
  }

  @override
  void dispose() {
    stopLocationStream();
    _locationController.close();
    super.dispose();
  }

  bool _isCompletingOrder = false;

  bool get isCompletingOrder => _isCompletingOrder;

  Future<bool> completeOrder(
    LoginResponse loginResponse,
    ShippingOrder order,
    String status,
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
          "orderId": order.id,
          "status": status,
          "shipperId": loginResponse.user.id.toString(),
          "routeStepId": int.parse(order.routeStep.id.toString()),
        }),
      );

      if (response.statusCode == 201) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    } finally {
      _isCompletingOrder = false;
      notifyListeners();
    }
  }
}
