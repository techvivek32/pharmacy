import 'package:flutter/material.dart';
import '../services/delivery_service.dart';

class DeliveryProvider with ChangeNotifier {
  List<dynamic> _deliveries = [];
  dynamic _currentDelivery;
  bool _isLoading = false;
  String? _error;

  List<dynamic> get deliveries => _deliveries;
  dynamic get currentDelivery => _currentDelivery;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchNearbyDeliveries() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await DeliveryService.getNearbyDeliveries();
      
      if (result.success) {
        _deliveries = result.data ?? [];
      } else {
        _error = result.message;
      }
    } catch (e) {
      _error = 'Failed to load deliveries: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> acceptDelivery(String orderId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await DeliveryService.acceptDelivery(orderId);

      _isLoading = false;
      notifyListeners();

      if (result.success) {
        _currentDelivery = result.data;
        await fetchNearbyDeliveries();
        return true;
      } else {
        _error = result.message;
        return false;
      }
    } catch (e) {
      _error = 'Failed to accept delivery: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateDeliveryStatus(String orderId, String status) async {
    try {
      final result = await DeliveryService.updateDeliveryStatus(orderId, status);
      
      if (result.success) {
        await fetchNearbyDeliveries();
        return true;
      } else {
        _error = result.message;
        return false;
      }
    } catch (e) {
      _error = 'Failed to update status: ${e.toString()}';
      return false;
    }
  }
}
