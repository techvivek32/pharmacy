import '../models/prescription_model.dart';
import 'api_service.dart';

class PrescriptionService {
  static Future<PrescriptionUploadResult> uploadPrescription({
    String? imageUrl,
    String? imagePublicId,
    String? address,
    List<double>? coordinates,
    List<Map<String, dynamic>>? medicines,
  }) async {
    try {
      final Map<String, dynamic> data = {};
      if (imageUrl != null) data['imageUrl'] = imageUrl;
      if (imagePublicId != null) data['imagePublicId'] = imagePublicId;
      if (address != null) data['address'] = address;
      if (coordinates != null) data['coordinates'] = coordinates;
      if (medicines != null && medicines.isNotEmpty) data['medicines'] = medicines;

      final response = await ApiService.post('/prescriptions/upload', data);

      if (response.success) {
        return PrescriptionUploadResult(
          success: true,
          prescriptionId: response.data['prescription']['_id'],
          message: response.message,
        );
      } else {
        return PrescriptionUploadResult(success: false, message: response.message);
      }
    } catch (e) {
      return PrescriptionUploadResult(
        success: false,
        message: 'Failed to upload prescription',
      );
    }
  }

  static Future<PrescriptionResult> getPrescriptionDetails(String id) async {
    try {
      final response = await ApiService.get('/prescriptions/$id');

      if (response.success) {
        final prescription = Prescription.fromJson(response.data['prescription']);
        return PrescriptionResult(success: true, prescription: prescription);
      } else {
        return PrescriptionResult(success: false, message: response.message);
      }
    } catch (e) {
      return PrescriptionResult(
        success: false,
        message: 'Failed to fetch prescription',
      );
    }
  }

  static Future<List<Prescription>> getPrescriptionHistory() async {
    try {
      final response = await ApiService.get('/prescriptions/history');

      if (response.success) {
        final List<dynamic> data = response.data['prescriptions'];
        return data.map((json) => Prescription.fromJson(json)).toList();
      }
    } catch (e) {
      return [];
    }
    return [];
  }
}

class PrescriptionUploadResult {
  final bool success;
  final String? message;
  final String? prescriptionId;

  PrescriptionUploadResult({
    required this.success,
    this.message,
    this.prescriptionId,
  });
}

class PrescriptionResult {
  final bool success;
  final String? message;
  final Prescription? prescription;

  PrescriptionResult({
    required this.success,
    this.message,
    this.prescription,
  });
}
