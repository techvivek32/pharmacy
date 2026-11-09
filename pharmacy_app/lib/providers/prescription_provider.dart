import 'package:flutter/material.dart';
import '../services/prescription_service.dart';
import '../services/api_service.dart';

class PrescriptionProvider with ChangeNotifier {
  List<dynamic> _prescriptions = [];
  List<dynamic> _missed = [];
  bool _isLoading = false;
  String? _error;
  int _confirmedCount = 0;
  int _completedCount = 0;

  List<dynamic> get prescriptions => _prescriptions;
  List<dynamic> get missed => _missed;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get confirmedCount => _confirmedCount;
  int get completedCount => _completedCount;

  Future<void> fetchPrescriptionRequests({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      _error = null;
      notifyListeners();
    }

    try {
      final result = await PrescriptionService.getPrescriptionRequests();

      if (result.success) {
        final data = result.data;
        if (data != null && data['prescriptions'] is List) {
          final all = List<dynamic>.from(data['prescriptions']);
          // Only show pending/quoted in the requests list — accepted means patient confirmed
          _prescriptions = all.where((p) => p['status'] != 'accepted').toList();
        } else {
          _prescriptions = [];
        }
        // Requests that were auto-moved to another pharmacy (no quote in time)
        _missed = data != null && data['missed'] is List
            ? List<dynamic>.from(data['missed'])
            : [];
      } else if (!silent) {
        _error = result.message;
      }

      // Fetch order counts
      final ordersResponse = await ApiService.get('/pharmacy/orders');
      if (ordersResponse.success) {
        final orders = (ordersResponse.data['orders'] as List?) ?? [];
        _confirmedCount = orders.where((o) => !['delivered', 'cancelled', 'pending'].contains(o['status'])).length;
        _completedCount = orders.where((o) => o['status'] == 'delivered').length;
      }
    } catch (e) {
      // Localization key; translated at the display site.
      if (!silent) _error = 'connection_error_retry';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> sendQuote({
    required String prescriptionId,
    required List<Map<String, dynamic>> items,
    required double deliveryFee,
    Map<String, String>? paymentMethod,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await PrescriptionService.sendQuote(
        prescriptionId: prescriptionId,
        items: items,
        deliveryFee: deliveryFee,
        paymentMethod: paymentMethod,
      );

      _isLoading = false;
      notifyListeners();

      if (result.success) {
        await fetchPrescriptionRequests();
        return true;
      } else {
        _error = result.message;
        return false;
      }
    } catch (e) {
      _error = 'failed_send_quote';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
