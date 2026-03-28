import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/input_field.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../services/address_service.dart';
import 'simple_location_picker.dart';

class AddAddressScreen extends StatefulWidget {
  final Map<String, dynamic>? address;

  const AddAddressScreen({super.key, this.address});

  @override
  State<AddAddressScreen> createState() => _AddAddressScreenState();
}

class _AddAddressScreenState extends State<AddAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _labelController;
  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _zipCodeController;
  late TextEditingController _stateController;
  bool _isDefault = false;
  bool _isLoading = false;
  bool _isFetchingLocation = false;
  double? _latitude;
  double? _longitude;

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: widget.address?['label'] ?? '');
    _addressController = TextEditingController(text: widget.address?['address'] ?? '');
    _cityController = TextEditingController(text: widget.address?['city'] ?? '');
    _zipCodeController = TextEditingController(text: widget.address?['zipCode'] ?? '');
    _stateController = TextEditingController(text: widget.address?['state'] ?? '');
    _isDefault = widget.address?['isDefault'] ?? false;
    _latitude = widget.address?['latitude'];
    _longitude = widget.address?['longitude'];
  }

  @override
  void dispose() {
    _labelController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _zipCodeController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isFetchingLocation = true);

    try {
      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enable location services')),
          );
        }
        setState(() => _isFetchingLocation = false);
        return;
      }

      // Check location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Location permission denied')),
            );
          }
          setState(() => _isFetchingLocation = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Location permissions are permanently denied'),
            ),
          );
        }
        setState(() => _isFetchingLocation = false);
        return;
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      _latitude = position.latitude;
      _longitude = position.longitude;

      // Get address from coordinates
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        
        setState(() {
          _addressController.text = '${place.street ?? ''}, ${place.subLocality ?? ''}';
          _cityController.text = place.locality ?? '';
          _stateController.text = place.administrativeArea ?? '';
          _zipCodeController.text = place.postalCode ?? '';
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Location fetched! Please verify and complete the address'),
              backgroundColor: AppTheme.success,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching location: ${e.toString()}')),
        );
      }
    } finally {
      setState(() => _isFetchingLocation = false);
    }
  }

  Future<void> _openMapPicker() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SimpleLocationPicker(
          initialLatitude: _latitude,
          initialLongitude: _longitude,
        ),
      ),
    );

    if (result != null && mounted) {
      setState(() {
        _latitude = result['latitude'];
        _longitude = result['longitude'];
      });

      // Get detailed address from coordinates
      try {
        List<Placemark> placemarks = await placemarkFromCoordinates(
          _latitude!,
          _longitude!,
        );

        if (placemarks.isNotEmpty) {
          Placemark place = placemarks[0];
          setState(() {
            _addressController.text = '${place.street ?? ''}, ${place.subLocality ?? ''}';
            _cityController.text = place.locality ?? '';
            _stateController.text = place.administrativeArea ?? '';
            _zipCodeController.text = place.postalCode ?? '';
          });
        }
      } catch (e) {
        // Ignore error, user can fill manually
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location selected! Please verify address details'),
          backgroundColor: AppTheme.success,
        ),
      );
    }
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    // Check if location was fetched
    if (_latitude == null || _longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fetch your location first using GPS'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final isEditing = widget.address != null;
      final AddressResult result;
      
      if (isEditing) {
        // Update existing address
        result = await AddressService.updateAddress(
          id: widget.address!['_id'],
          label: _labelController.text.trim(),
          address: _addressController.text.trim(),
          city: _cityController.text.trim(),
          state: _stateController.text.trim(),
          zipCode: _zipCodeController.text.trim(),
          latitude: _latitude!,
          longitude: _longitude!,
          isDefault: _isDefault,
        );
      } else {
        // Add new address
        result = await AddressService.addAddress(
          label: _labelController.text.trim(),
          address: _addressController.text.trim(),
          city: _cityController.text.trim(),
          state: _stateController.text.trim(),
          zipCode: _zipCodeController.text.trim(),
          latitude: _latitude!,
          longitude: _longitude!,
          isDefault: _isDefault,
        );
      }

      setState(() => _isLoading = false);

      if (!mounted) return;

      if (result.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.message ?? '${isEditing ? "Updated" : "Saved"} successfully'),
            backgroundColor: AppTheme.success,
          ),
        );
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.message ?? 'Failed to ${isEditing ? "update" : "save"} address'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to ${widget.address != null ? "update" : "save"} address'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.address != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Address' : 'Add Address'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // GPS Location Button
              Container(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                  border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(
                          _latitude != null ? Icons.check_circle : Icons.location_on,
                          color: _latitude != null ? AppTheme.success : AppTheme.primary,
                        ),
                        const SizedBox(width: AppTheme.spacing12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _latitude != null ? 'Location Fetched' : 'Fetch Your Location',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      color: _latitude != null ? AppTheme.success : AppTheme.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              const SizedBox(height: AppTheme.spacing4),
                              Text(
                                _latitude != null
                                    ? 'GPS coordinates captured. Please verify address details below.'
                                    : 'Required: Use GPS to get your current location',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (_latitude == null) ...[
                      const SizedBox(height: AppTheme.spacing12),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _isFetchingLocation ? null : _getCurrentLocation,
                              icon: _isFetchingLocation
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Icon(Icons.my_location),
                              label: Text(_isFetchingLocation ? 'Fetching...' : 'Use GPS'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _openMapPicker,
                              icon: const Icon(Icons.map),
                              label: const Text('Pick on Map'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppTheme.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ] else ...[
                      const SizedBox(height: AppTheme.spacing12),
                      OutlinedButton.icon(
                        onPressed: _openMapPicker,
                        icon: const Icon(Icons.edit_location),
                        label: const Text('Adjust Location on Map'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.primary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),
              Text(
                'Address Details',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: AppTheme.spacing16),
              InputField(
                controller: _labelController,
                label: 'Label (e.g., Home, Work)',
                prefixIcon: const Icon(Icons.label),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Label is required';
                  return null;
                },
              ),
              const SizedBox(height: AppTheme.spacing16),
              InputField(
                controller: _addressController,
                label: 'Street Address *',
                prefixIcon: const Icon(Icons.home),
                maxLines: 2,
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Address is required';
                  return null;
                },
              ),
              const SizedBox(height: AppTheme.spacing16),
              InputField(
                controller: _cityController,
                label: 'City *',
                prefixIcon: const Icon(Icons.location_city),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'City is required';
                  return null;
                },
              ),
              const SizedBox(height: AppTheme.spacing16),
              InputField(
                controller: _stateController,
                label: 'State *',
                prefixIcon: const Icon(Icons.map),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'State is required';
                  return null;
                },
              ),
              const SizedBox(height: AppTheme.spacing16),
              InputField(
                controller: _zipCodeController,
                label: 'ZIP Code *',
                prefixIcon: const Icon(Icons.pin_drop),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'ZIP code is required';
                  return null;
                },
              ),
              const SizedBox(height: AppTheme.spacing24),
              CheckboxListTile(
                value: _isDefault,
                onChanged: (value) => setState(() => _isDefault = value ?? false),
                title: const Text('Set as default address'),
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
                activeColor: AppTheme.primary,
              ),
              const SizedBox(height: AppTheme.spacing32),
              PrimaryButton(
                text: isEditing ? 'Update Address' : 'Save Address',
                onPressed: _saveAddress,
                isLoading: _isLoading,
              ),
              const SizedBox(height: AppTheme.spacing16),
              Center(
                child: Text(
                  '* All fields are mandatory',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textSecondary,
                        fontStyle: FontStyle.italic,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
