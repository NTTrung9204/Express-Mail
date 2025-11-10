import 'dart:async';
import 'dart:convert';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:vietmap_flutter_gl/vietmap_flutter_gl.dart';
import 'package:express_mail/constants/Constants.dart';

class MapViewModel extends ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;

  LatLng? _origin;
  LatLng? _destination;
  List<LatLng> _routePoints = [];
  List<String> _instructions = [];
  double? _distance;
  int? _estimatedTime;

  final StreamController<LatLng> _locationController =
      StreamController.broadcast();

  Stream<LatLng> get currentLocationStream => _locationController.stream;
  StreamSubscription<LatLng>? _positionSub;

  bool get isLoading => _isLoading;

  String? get errorMessage => _errorMessage;

  LatLng? get origin => _origin;

  LatLng? get destination => _destination;

  List<LatLng> get routePoints => _routePoints;

  List<String> get instructions => _instructions;

  double? get distance => _distance;

  int? get estimatedTime => _estimatedTime;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String? msg) {
    _errorMessage = msg;
    notifyListeners();
  }

  Future<LatLng?> getCurrentLocation() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        _setError(AppStrings.location_access_is_not_enabled_on_the_device);
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _setError(AppStrings.location_access_denied);
          return null;
        }
      }
      if (permission == LocationPermission.deniedForever) {
        _setError(AppStrings.location_access_denied);
        return null;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      return LatLng(position.latitude, position.longitude);
    } catch (e) {
      _setError(AppStrings.error_getting_coordinates);
      return null;
    }
  }

  Future<LatLng?> getLatLngFromAddress(String text, {LatLng? focus}) async {
    final apiKey = Constants.keyMap;
    String url =
        'https://maps.vietmap.vn/api/search/v3?apikey=$apiKey&text=${Uri.encodeComponent(text)}';
    if (focus != null) url += '&focus=${focus.latitude},${focus.longitude}';

    try {
      final res = await http.get(Uri.parse(url));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is List && data.isNotEmpty) {
          final refId = data[0]['ref_id'] as String?;
          if (refId != null) {
            final placeRes = await http.get(
              Uri.parse(
                'https://maps.vietmap.vn/api/place/v3?apikey=$apiKey&refid=$refId',
              ),
            );
            if (placeRes.statusCode == 200) {
              final placeData = jsonDecode(placeRes.body);
              final lat = (placeData['lat'] as num?)?.toDouble();
              final lng = (placeData['lng'] as num?)?.toDouble();
              if (lat != null && lng != null) return LatLng(lat, lng);
            }
          }
        }
      }
    } catch (e) {
      _setError(AppStrings.error_getting_coordinates);
    }
    return null;
  }

  List<LatLng> decodePolyline(String encoded) {
    final List<LatLng> points = [];
    int index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1F) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1F) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.add(LatLng(lat / 1e5, lng / 1e5));
    }

    return points;
  }

  Future<bool> fetchRoute({
    required LatLng origin,
    required LatLng destination,
  }) async {
    _setLoading(true);
    _setError(null);
    _routePoints.clear();
    _instructions.clear();
    _origin = origin;
    _destination = destination;
    _distance = null;
    _estimatedTime = null;

    final apiKey = Constants.keyMap;
    final url =
        'https://maps.vietmap.vn/api/route?api-version=1.1&apikey=$apiKey'
        '&point=${origin.latitude},${origin.longitude}'
        '&point=${destination.latitude},${destination.longitude}'
        '&vehicle=motorcycle';

    try {
      final res = await http.get(Uri.parse(url));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final path = data['paths']?[0];
        if (path != null) {
          final pointsEncoded = path['points'] as String?;
          if (pointsEncoded != null)
            _routePoints = decodePolyline(pointsEncoded);

          _distance = (path['distance'] as num?)?.toDouble();
          final timeMs = (path['time'] as num?)?.toInt();
          if (timeMs != null) _estimatedTime = (timeMs / 1000).toInt();

          final instr = path['instructions'] as List<dynamic>?;
          if (instr != null) {
            _instructions = instr.map<String>((i) {
              final text = i['text'] ?? '';
              final distanceStep = (i['distance'] as num?)?.toDouble() ?? 0;
              final timeStep = ((i['time'] as num?)?.toInt() ?? 0) ~/ 1000;
              final street = i['street_name'] ?? '';
              return "$text (${distanceStep.toStringAsFixed(0)}m, $timeStep giây) [$street]";
            }).toList();
          }

          notifyListeners();
          return true;
        } else {
          _setError(AppStrings.no_route_data);
        }
      } else {
        _setError(AppStrings.connection_error);
      }
    } catch (e) {
      _setError(AppStrings.connection_error);
    } finally {
      _setLoading(false);
    }
    return false;
  }

  void startLocationStream({int milliseconds = 2000}) async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      _setError(AppStrings.location_access_is_not_enabled_on_the_device);
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _setError(AppStrings.location_access_denied);
        return;
      }
    }
    if (permission == LocationPermission.deniedForever) {
      _setError(AppStrings.location_access_denied);
      return;
    }

    _positionSub?.cancel();
    _positionSub = Stream.periodic(Duration(milliseconds: milliseconds))
        .asyncMap((_) async {
          final position = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.high,
          );
          return LatLng(position.latitude, position.longitude);
        })
        .listen((latLng) {
          _locationController.add(latLng);
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
}
