import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

class LocationService {
  static Timer? _timer;
  static bool _isTracking = false;

  /// Request location permission. Returns true if granted.
  static Future<bool> requestPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    return permission == LocationPermission.whileInUse ||
        permission == LocationPermission.always;
  }

  /// Get current position once.
  static Future<Position?> getCurrentPosition() async {
    final granted = await requestPermission();
    if (!granted) return null;
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
    } catch (_) {
      return null;
    }
  }

  /// Send current location to backend and mark rider online.
  static Future<void> updateLocation({bool isOnline = true}) async {
    final pos = await getCurrentPosition();
    if (pos == null) return;
    await ApiService.put('/rider/update-location', {
      'lat': pos.latitude,
      'lng': pos.longitude,
      'isOnline': isOnline,
    });
  }

  /// Start periodic location updates every 30 seconds.
  static void startTracking() {
    if (_isTracking) return;
    _isTracking = true;
    updateLocation(); // send immediately
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => updateLocation());
  }

  /// Stop tracking and mark rider offline.
  static Future<void> stopTracking() async {
    _timer?.cancel();
    _timer = null;
    _isTracking = false;
    await ApiService.put('/rider/update-location', {
      'lat': 0,
      'lng': 0,
      'isOnline': false,
    });
  }

  static bool get isTracking => _isTracking;
}
