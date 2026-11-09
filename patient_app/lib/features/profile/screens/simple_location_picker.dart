import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/localization/app_localizations.dart';

class SimpleLocationPicker extends StatefulWidget {
  final double? initialLatitude;
  final double? initialLongitude;

  const SimpleLocationPicker({
    super.key,
    this.initialLatitude,
    this.initialLongitude,
  });

  @override
  State<SimpleLocationPicker> createState() => _SimpleLocationPickerState();
}

class _SimpleLocationPickerState extends State<SimpleLocationPicker> {
  double? _latitude;
  double? _longitude;
  String _address = '';
  bool _isLoading = false;
  bool _isFetchingAddress = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialLatitude != null && widget.initialLongitude != null) {
      _latitude = widget.initialLatitude;
      _longitude = widget.initialLongitude;
      _getAddressFromLatLng(_latitude!, _longitude!);
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoading = true);

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(AppLocalizations.of(context)!.translate('enable_location_services'))),
          );
        }
        setState(() => _isLoading = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(AppLocalizations.of(context)!.translate('location_permission_denied'))),
            );
          }
          setState(() => _isLoading = false);
          return;
        }
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
        _isLoading = false;
      });

      _getAddressFromLatLng(_latitude!, _longitude!);
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${AppLocalizations.of(context)!.translate('error')}: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _getAddressFromLatLng(double lat, double lng) async {
    setState(() => _isFetchingAddress = true);

    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);

      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        setState(() {
          _address = '${place.street ?? ''}, ${place.subLocality ?? ''}, ${place.locality ?? ''}, ${place.administrativeArea ?? ''}';
          _isFetchingAddress = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _address = AppLocalizations.of(context)!.translate('unable_fetch_address');
        _isFetchingAddress = false;
      });
    }
  }

  void _confirmLocation() {
    if (_latitude != null && _longitude != null) {
      Navigator.pop(context, {
        'latitude': _latitude,
        'longitude': _longitude,
        'address': _address,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('select_location')),
      ),
      body: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _latitude != null ? Icons.location_on : Icons.location_off,
              size: 100,
              color: _latitude != null ? AppTheme.primary : AppTheme.textSecondary,
            ),
            const SizedBox(height: AppTheme.spacing32),
            Text(
              _latitude != null ? l10n.translate('location_selected') : l10n.translate('no_location_selected'),
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: AppTheme.spacing16),
            if (_latitude != null) ...[
              Container(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: AppTheme.primary),
                        const SizedBox(width: AppTheme.spacing8),
                        Expanded(
                          child: _isFetchingAddress
                              ? Text(l10n.translate('fetching_address'))
                              : Text(
                                  _address.isEmpty ? l10n.translate('no_location_selected') : _address,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing12),
                    Text(
                      '${l10n.translate('latitude')}: ${_latitude!.toStringAsFixed(6)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                    ),
                    Text(
                      '${l10n.translate('longitude')}: ${_longitude!.toStringAsFixed(6)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              Text(
                l10n.translate('use_gps_desc'),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: AppTheme.spacing32),
            if (_latitude == null)
              PrimaryButton(
                text: l10n.translate('get_current_location'),
                onPressed: _isLoading ? null : _getCurrentLocation,
                isLoading: _isLoading,
                icon: Icons.my_location,
              )
            else
              Column(
                children: [
                  PrimaryButton(
                    text: l10n.translate('confirm_location'),
                    onPressed: _confirmLocation,
                    icon: Icons.check,
                  ),
                  const SizedBox(height: AppTheme.spacing12),
                  OutlinedButton.icon(
                    onPressed: _getCurrentLocation,
                    icon: const Icon(Icons.refresh),
                    label: Text(l10n.translate('get_location_again')),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primary,
                      minimumSize: const Size(double.infinity, 48),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
