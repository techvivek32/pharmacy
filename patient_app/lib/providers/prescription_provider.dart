import 'package:flutter/material.dart';
import '../services/prescription_service.dart';
import '../models/prescription_model.dart';

class PrescriptionProvider with ChangeNotifier {
  List<Prescription> _prescriptions = [];
  Prescription? _currentPrescription;
  bool _isLoading = false;
  String? _error;

  List<Prescription> get prescriptions => _prescriptions;
  Prescription? get currentPrescription => _currentPrescription;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<bool> uploadPrescription({
    required String imageUrl,
    required String imagePublicId,
    String? address,
    List<double>? coordinates,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await PrescriptionService.uploadPrescription(
        imageUrl: imageUrl,
        imagePublicId: imagePublicId,
        address: address,
        coordinates: coordinates,
      );

      if (result.success) {
        // Load the prescription details if we have an ID
        if (result.prescriptionId != null) {
          await getPrescriptionDetails(result.prescriptionId!);
        }
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result.message;
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Upload failed: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadPrescriptionHistory() async {
    _isLoading = true;
    notifyListeners();

    try {
      _prescriptions = await PrescriptionService.getPrescriptionHistory();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> getPrescriptionDetails(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      final result = await PrescriptionService.getPrescriptionDetails(id);
      if (result.success) {
        _currentPrescription = result.prescription;
      } else {
        _error = result.message;
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
