import 'api_service.dart';

class DeliveryService {
  static Future<ApiResponse> getNearbyDeliveries() async {
    return await ApiService.get('/rider/nearby-deliveries');
  }

  static Future<ApiResponse> acceptDelivery(String orderId) async {
    return await ApiService.post('/rider/accept-delivery', {
      'orderId': orderId,
    });
  }

  static Future<ApiResponse> updateDeliveryStatus(String orderId, String status) async {
    return await ApiService.put('/rider/update-status', {
      'orderId': orderId,
      'status': status,
    });
  }
}
