import 'package:flutter/material.dart';
import '../services/prescription_service.dart';

class PrescriptionProvider with ChangeNotifier {
  List<dynamic> _prescriptions = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get prescriptions => _prescriptions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchPrescriptionRequests() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await PrescriptionService.getPrescriptionRequests();

      if (result.success) {
        final data = result.data;
        if (data != null && data['prescriptions'] is List) {
          _prescriptions = List<dynamic>.from(data['prescriptions']);
        } else {
          _prescriptions = [];
        }
      } else {
        _error = result.message;
        // Keep old data visible on error instead of clearing
      }
    } catch (e) {
      _error = 'Connection error. Pull down to retry.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> sendQuote({
    required String prescriptionId,
    required List<Map<String, dynamic>> items,
    required double deliveryFee,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await PrescriptionService.sendQuote(
        prescriptionId: prescriptionId,
        items: items,
        deliveryFee: deliveryFee,
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
      _error = 'Failed to send quote: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
