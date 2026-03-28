import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Pharmacy from '@/models/Pharmacy';
import Patient from '@/models/Patient';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { sendNotificationToPharmacies } from '@/services/notification';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'patient') {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { imageUrl, imagePublicId, address, coordinates } = body;

    if (!imageUrl) {
      return errorResponse('Image URL is required');
    }

    // Get patient
    const patient = await Patient.findOne({ userId: auth.userId });
    if (!patient) {
      return errorResponse('Patient profile not found', 404);
    }

    // Create prescription data
    const prescriptionData: any = {
      patientId: patient._id,
      imageUrl,
      status: 'pending',
    };

    if (imagePublicId) {
      prescriptionData.imagePublicId = imagePublicId;
    }

    // Add delivery address if provided
    if (address && coordinates) {
      prescriptionData.deliveryAddress = {
        address,
        location: {
          type: 'Point',
          coordinates,
        },
      };

      // Find nearby pharmacies within 5km
      const nearbyPharmacies = await Pharmacy.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates, // [longitude, latitude]
            },
            $maxDistance: 5000, // 5km in meters
          },
        },
        isOpen: true,
      }).limit(20);

      if (nearbyPharmacies.length > 0) {
        prescriptionData.nearbyPharmacies = nearbyPharmacies.map((p) => p._id);

        // Send notifications to nearby pharmacies
        await sendNotificationToPharmacies(
          nearbyPharmacies.map((p) => p.userId.toString()),
          'New Prescription Request',
          'A patient nearby needs medicine delivery',
          {
            prescriptionId: prescriptionData._id?.toString(),
            type: 'prescription_request',
          }
        );
      }
    }

    // Create prescription
    const prescription = await Prescription.create(prescriptionData);

    return successResponse(
      {
        prescription: {
          _id: prescription._id,
          imageUrl: prescription.imageUrl,
          status: prescription.status,
          nearbyPharmaciesCount: prescriptionData.nearbyPharmacies?.length || 0,
        },
      },
      'Prescription uploaded successfully',
      201
    );
  } catch (error: any) {
    console.error('Upload prescription error:', error);
    return errorResponse('Failed to upload prescription', 500);
  }
}
