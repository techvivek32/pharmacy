import 'api_service.dart';

class AddressService {
  static Future<AddressResult> getAddresses() async {
    try {
      final response = await ApiService.get('/patients/addresses');

      if (response.success) {
        return AddressResult(
          success: true,
          addresses: List<Map<String, dynamic>>.from(response.data['addresses'] ?? []),
        );
      } else {
        return AddressResult(success: false, message: response.message);
      }
    } catch (e) {
      return AddressResult(success: false, message: 'Failed to get addresses');
    }
  }

  static Future<AddressResult> addAddress({
    required String label,
    required String address,
    String? city,
    String? state,
    String? zipCode,
    required double latitude,
    required double longitude,
    bool isDefault = false,
  }) async {
    try {
      final response = await ApiService.post(
        '/patients/addresses',
        {
          'label': label,
          'address': address,
          'city': city ?? '',
          'state': state ?? '',
          'zipCode': zipCode ?? '',
          'latitude': latitude,
          'longitude': longitude,
          'isDefault': isDefault,
        },
      );

      if (response.success) {
        return AddressResult(
          success: true,
          addresses: List<Map<String, dynamic>>.from(response.data['addresses'] ?? []),
          message: response.message,
        );
      } else {
        return AddressResult(success: false, message: response.message);
      }
    } catch (e) {
      return AddressResult(success: false, message: 'Failed to add address');
    }
  }

  static Future<AddressResult> updateAddress({
    required String id,
    String? label,
    String? address,
    String? city,
    String? state,
    String? zipCode,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) async {
    try {
      final response = await ApiService.put(
        '/patients/addresses/$id',
        {
          if (label != null) 'label': label,
          if (address != null) 'address': address,
          'city': city ?? '',
          'state': state ?? '',
          'zipCode': zipCode ?? '',
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (isDefault != null) 'isDefault': isDefault,
        },
      );

      if (response.success) {
        return AddressResult(
          success: true,
          addresses: List<Map<String, dynamic>>.from(response.data['addresses'] ?? []),
          message: response.message,
        );
      } else {
        return AddressResult(success: false, message: response.message);
      }
    } catch (e) {
      return AddressResult(success: false, message: 'Failed to update address');
    }
  }

  static Future<AddressResult> deleteAddress(String id) async {
    try {
      final response = await ApiService.delete('/patients/addresses/$id');

      if (response.success) {
        return AddressResult(
          success: true,
          addresses: List<Map<String, dynamic>>.from(response.data['addresses'] ?? []),
          message: response.message,
        );
      } else {
        return AddressResult(success: false, message: response.message);
      }
    } catch (e) {
      return AddressResult(success: false, message: 'Failed to delete address');
    }
  }
}

class AddressResult {
  final bool success;
  final String? message;
  final List<Map<String, dynamic>>? addresses;

  AddressResult({
    required this.success,
    this.message,
    this.addresses,
  });
}
