import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart' as gmaps;
import 'package:geolocator/geolocator.dart';
import 'package:lottie/lottie.dart';

class MapFragment extends StatefulWidget {
  const MapFragment({super.key});

  @override
  State<MapFragment> createState() => _MapFragmentState();
}

class _MapFragmentState extends State<MapFragment> {
  gmaps.GoogleMapController? mapController;
  gmaps.LatLng? _currentPosition;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }

  Future<void> _determinePosition() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _errorMessage = 'Location services are disabled.';
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _errorMessage = 'Location permissions are denied.';
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _errorMessage =
          'Location permissions are permanently denied. Please enable them in settings.';
        });
        return;
      }

      Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);

      setState(() {
        _currentPosition = gmaps.LatLng(position.latitude, position.longitude);
      });

      _moveCameraToCurrentPosition();
    } catch (e) {
      setState(() {
        _errorMessage = 'Error getting location: $e';
      });
    }
  }

  void _moveCameraToCurrentPosition() {
    if (mapController != null && _currentPosition != null) {
      mapController!.animateCamera(
        gmaps.CameraUpdate.newCameraPosition(
          gmaps.CameraPosition(target: _currentPosition!, zoom: 16),
        ),
      );
    }
  }

  void _onMapCreated(gmaps.GoogleMapController controller) {
    mapController = controller;
    _moveCameraToCurrentPosition();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Google Map
          gmaps.GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: gmaps.CameraPosition(
              target: _currentPosition ?? gmaps.LatLng(0, 0),
              zoom: _currentPosition != null ? 16 : 1,
            ),
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            markers: _currentPosition != null
                ? <gmaps.Marker>{
              gmaps.Marker(
                markerId: const gmaps.MarkerId('current'),
                position: _currentPosition!,
                infoWindow:
                const gmaps.InfoWindow(title: 'Your Location'),
              ),
            }
                : {},
            mapType: gmaps.MapType.normal,
            mapToolbarEnabled: false,
          ),

          // Overlay Lottie khi load
          if (_currentPosition == null && _errorMessage == null)
            Container(
              color: Colors.white,
              child: Center(
                child: Lottie.asset(
                  'assets/animation/ani_load.json',
                  width: 150,
                  height: 150,
                  fit: BoxFit.contain,
                ),
              ),
            ),

          // Hiển thị lỗi nếu có
          if (_errorMessage != null)
            Center(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.all(16),
                child: Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: Colors.red, fontWeight: FontWeight.bold),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
