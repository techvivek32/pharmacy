import 'dart:async';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import 'package:geolocator/geolocator.dart';
import '../../../core/theme/app_theme.dart';
import '../../../services/api_service.dart';

class MapNavigationScreen extends StatefulWidget {
  final String title;
  final String address;
  final LatLng destination;

  const MapNavigationScreen({
    super.key,
    required this.title,
    required this.address,
    required this.destination,
  });

  @override
  State<MapNavigationScreen> createState() => _MapNavigationScreenState();
}

class _MapNavigationScreenState extends State<MapNavigationScreen> {
  final MapController _mapController = MapController();
  StreamSubscription<Position>? _locationSub;
  LatLng? _riderPos;
  bool _followRider = true;

  @override
  void initState() {
    super.initState();
    _startTracking();
  }

  @override
  void dispose() {
    _locationSub?.cancel();
    super.dispose();
  }

  Future<void> _startTracking() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) return;

      // Get initial position
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      ).catchError((_) => null);
      if (pos != null && mounted) {
        setState(() => _riderPos = LatLng(pos.latitude, pos.longitude));
        _mapController.move(_riderPos!, 15);
      }

      // Stream updates
      _locationSub = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        ),
      ).listen((pos) {
        if (!mounted) return;
        final newPos = LatLng(pos.latitude, pos.longitude);
        setState(() => _riderPos = newPos);
        if (_followRider) _mapController.move(newPos, _mapController.camera.zoom);
        // Update backend
        ApiService.put('/rider/update-location', {
          'lat': pos.latitude,
          'lng': pos.longitude,
          'isOnline': true,
        });
      }, onError: (_) {});
    } catch (_) {}
  }

  double? _calcDistance() {
    if (_riderPos == null) return null;
    const dist = Distance();
    return dist.as(LengthUnit.Kilometer, _riderPos!, widget.destination);
  }

  void _centerOnDestination() {
    setState(() => _followRider = false);
    _mapController.move(widget.destination, 16);
  }

  void _centerOnRider() {
    if (_riderPos == null) return;
    setState(() => _followRider = true);
    _mapController.move(_riderPos!, 16);
  }

  @override
  Widget build(BuildContext context) {
    final distKm = _calcDistance();

    return Scaffold(
      body: Stack(
        children: [
          // OpenStreetMap — completely free, no API key
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: widget.destination,
              initialZoom: 14,
              onPositionChanged: (_, hasGesture) {
                if (hasGesture) setState(() => _followRider = false);
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.ordogo.rider',
              ),
              // Line from rider to destination
              if (_riderPos != null)
                PolylineLayer<Object>(
                  polylines: [
                    Polyline(
                      points: [_riderPos!, widget.destination],
                      color: AppTheme.primary,
                      strokeWidth: 4,
                      pattern: StrokePattern.dashed(segments: [10, 6]),
                    ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  // Destination marker
                  Marker(
                    point: widget.destination,
                    width: 50,
                    height: 60,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: AppTheme.error,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.location_on, color: Colors.white, size: 20),
                        ),
                        CustomPaint(
                          size: const Size(12, 8),
                          painter: _TrianglePainter(AppTheme.error),
                        ),
                      ],
                    ),
                  ),
                  // Rider marker
                  if (_riderPos != null)
                    Marker(
                      point: _riderPos!,
                      width: 44,
                      height: 44,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppTheme.primary,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 6)],
                        ),
                        child: const Icon(Icons.navigation, color: Colors.white, size: 20),
                      ),
                    ),
                ],
              ),
            ],
          ),

          // Top bar
          Positioned(
            top: 0, left: 0, right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 6)],
                        ),
                        child: const Icon(Icons.arrow_back, size: 20),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 6)],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.location_on, color: AppTheme.error, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(widget.title,
                                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                  Text(widget.address,
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                            if (distKm != null) ...[
                              const SizedBox(width: 8),
                              Text(
                                '${distKm.toStringAsFixed(1)} km',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // FAB buttons
          Positioned(
            right: 12,
            bottom: 100,
            child: Column(
              children: [
                _mapFab(
                  icon: Icons.my_location,
                  onTap: _centerOnRider,
                  active: _followRider,
                ),
                const SizedBox(height: 8),
                _mapFab(
                  icon: Icons.flag,
                  onTap: _centerOnDestination,
                  active: !_followRider,
                ),
              ],
            ),
          ),

          // Bottom distance card
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 28),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.directions_bike, color: AppTheme.primary),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        Text(widget.address,
                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  if (distKm != null)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('${distKm.toStringAsFixed(1)} km',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                                color: AppTheme.primary)),
                        const Text('away', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      ],
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _mapFab({required IconData icon, required VoidCallback onTap, required bool active}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 42, height: 42,
        decoration: BoxDecoration(
          color: active ? AppTheme.primary : Colors.white,
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 6)],
        ),
        child: Icon(icon, size: 20, color: active ? Colors.white : AppTheme.textPrimary),
      ),
    );
  }
}

class _TrianglePainter extends CustomPainter {
  final Color color;
  _TrianglePainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    final path = ui.Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width / 2, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_) => false;
}
