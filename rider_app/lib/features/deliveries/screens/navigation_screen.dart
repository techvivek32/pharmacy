import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/theme/app_theme.dart';
import '../../../services/api_service.dart';
import '../../../services/location_service.dart';

class NavigationScreen extends StatefulWidget {
  final Map<String, dynamic> delivery;

  const NavigationScreen({super.key, required this.delivery});

  @override
  State<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  GoogleMapController? _mapController;
  StreamSubscription<Position>? _locationSub;
  Timer? _statusTimer;

  LatLng? _riderPos;
  // Phase: 'to_pharmacy' → 'at_pharmacy' → 'to_patient' → 'delivered'
  String _phase = 'to_pharmacy';
  bool _isUpdating = false;

  late final LatLng? _pharmacyLatLng;
  late final LatLng? _patientLatLng;

  @override
  void initState() {
    super.initState();

    final pharmCoords = widget.delivery['pharmacyCoords'] as List?;
    final delivCoords = widget.delivery['deliveryCoords'] as List?;

    _pharmacyLatLng = pharmCoords != null && pharmCoords.length == 2
        ? LatLng((pharmCoords[1] as num).toDouble(), (pharmCoords[0] as num).toDouble())
        : null;

    _patientLatLng = delivCoords != null && delivCoords.length == 2
        ? LatLng((delivCoords[1] as num).toDouble(), (delivCoords[0] as num).toDouble())
        : null;

    _startLiveTracking();
  }

  @override
  void dispose() {
    _locationSub?.cancel();
    _statusTimer?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  void _startLiveTracking() {
    _locationSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((pos) {
      final newPos = LatLng(pos.latitude, pos.longitude);
      setState(() => _riderPos = newPos);
      _mapController?.animateCamera(CameraUpdate.newLatLng(newPos));

      // Send location to backend every update
      ApiService.put('/rider/update-location', {
        'lat': pos.latitude,
        'lng': pos.longitude,
        'isOnline': true,
      });
    });
  }

  Future<void> _arrivedAtPharmacy() async {
    setState(() => _isUpdating = true);
    final res = await ApiService.put('/rider/update-status', {
      'orderId': widget.delivery['orderId'].toString(),
      'status': 'picked_up',
    });
    setState(() => _isUpdating = false);
    if (res.success) {
      setState(() => _phase = 'to_patient');
      _moveCameraTo(_patientLatLng);
    } else {
      _showError(res.message);
    }
  }

  Future<void> _arrivedAtPatient() async {
    setState(() => _isUpdating = true);
    final res = await ApiService.put('/rider/update-status', {
      'orderId': widget.delivery['orderId'].toString(),
      'status': 'delivered',
    });
    setState(() => _isUpdating = false);
    if (res.success) {
      setState(() => _phase = 'delivered');
    } else {
      _showError(res.message);
    }
  }

  void _moveCameraTo(LatLng? target) {
    if (target == null) return;
    _mapController?.animateCamera(CameraUpdate.newLatLngZoom(target, 15));
  }

  void _showError(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: AppTheme.error),
      );
    }
  }

  Set<Marker> _buildMarkers() {
    final markers = <Marker>{};

    if (_riderPos != null) {
      markers.add(Marker(
        markerId: const MarkerId('rider'),
        position: _riderPos!,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        infoWindow: const InfoWindow(title: 'You'),
      ));
    }

    if (_pharmacyLatLng != null) {
      markers.add(Marker(
        markerId: const MarkerId('pharmacy'),
        position: _pharmacyLatLng!,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        infoWindow: InfoWindow(title: 'Pharmacy', snippet: widget.delivery['pickupAddress'] ?? ''),
      ));
    }

    if (_patientLatLng != null) {
      markers.add(Marker(
        markerId: const MarkerId('patient'),
        position: _patientLatLng!,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: InfoWindow(title: 'Patient', snippet: widget.delivery['deliveryAddress'] ?? ''),
      ));
    }

    return markers;
  }

  LatLng get _initialCameraTarget {
    if (_pharmacyLatLng != null) return _pharmacyLatLng!;
    if (_patientLatLng != null) return _patientLatLng!;
    return const LatLng(33.5731, -7.5898); // Casablanca default
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: _phase == 'delivered',
      child: Scaffold(
        body: Stack(
          children: [
            // Full screen map
            GoogleMap(
              initialCameraPosition: CameraPosition(
                target: _initialCameraTarget,
                zoom: 14,
              ),
              onMapCreated: (controller) {
                _mapController = controller;
                if (_pharmacyLatLng != null) {
                  _moveCameraTo(_pharmacyLatLng);
                }
              },
              markers: _buildMarkers(),
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
            ),

            // Top bar
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Container(
                  margin: const EdgeInsets.all(AppTheme.spacing16),
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.spacing16,
                    vertical: AppTheme.spacing12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: _phase == 'delivered' ? AppTheme.success : AppTheme.warning,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: AppTheme.spacing8),
                      Expanded(
                        child: Text(
                          _phase == 'to_pharmacy'
                              ? 'Head to Pharmacy'
                              : _phase == 'to_patient'
                                  ? 'Head to Patient'
                                  : 'Delivery Complete!',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                        ),
                      ),
                      Text(
                        '${widget.delivery['deliveryFee'] ?? 0} MAD',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.success,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Bottom action panel
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(
                  AppTheme.spacing16,
                  AppTheme.spacing20,
                  AppTheme.spacing16,
                  AppTheme.spacing32,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTheme.radiusXLarge)),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 12)],
                ),
                child: _buildBottomContent(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomContent() {
    if (_phase == 'delivered') {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, color: AppTheme.success, size: 48),
          const SizedBox(height: AppTheme.spacing12),
          const Text('Delivery Completed!',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: AppTheme.spacing4),
          Text('You earned ${widget.delivery['deliveryFee'] ?? 0} MAD',
              style: const TextStyle(color: AppTheme.success, fontWeight: FontWeight.w600)),
          const SizedBox(height: AppTheme.spacing20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/home', (_) => false),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMedium)),
              ),
              child: const Text('Back to Home', style: TextStyle(fontSize: 16)),
            ),
          ),
        ],
      );
    }

    final isToPharmacy = _phase == 'to_pharmacy';
    final targetAddress = isToPharmacy
        ? widget.delivery['pickupAddress'] ?? 'Pharmacy'
        : widget.delivery['deliveryAddress'] ?? 'Patient';

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: (isToPharmacy ? AppTheme.primary : AppTheme.error).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isToPharmacy ? Icons.store : Icons.location_on,
                color: isToPharmacy ? AppTheme.primary : AppTheme.error,
                size: 20,
              ),
            ),
            const SizedBox(width: AppTheme.spacing12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isToPharmacy ? 'Pickup from Pharmacy' : 'Deliver to Patient',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                  Text(
                    targetAddress,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppTheme.spacing16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isUpdating ? null : (isToPharmacy ? _arrivedAtPharmacy : _arrivedAtPatient),
            style: ElevatedButton.styleFrom(
              backgroundColor: isToPharmacy ? AppTheme.primary : AppTheme.success,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMedium)),
            ),
            child: _isUpdating
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text(
                    isToPharmacy ? 'Arrived at Pharmacy' : 'Arrived at Patient',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
          ),
        ),
      ],
    );
  }
}
