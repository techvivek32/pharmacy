import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Pharmacy from '@/models/Pharmacy';
import Patient from '@/models/Patient';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'patient') {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { prescriptionId, deliveryAddress } = body;

    if (!prescriptionId || !deliveryAddress) {
      return errorResponse('prescriptionId and deliveryAddress are required');
    }

    const patient = await Patient.findOne({ userId: auth.userId });
    if (!patient) return errorResponse('Patient profile not found', 404);

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      patientId: patient._id,
    });
    if (!prescription) return errorResponse('Prescription not found', 404);

    const addressText = deliveryAddress.address || deliveryAddress.label || 'Delivery address';
    const coordinates: [number, number] = deliveryAddress.coordinates ||
      deliveryAddress.location?.coordinates || [0, 0];

    // Update prescription delivery address
    prescription.deliveryAddress = {
      address: addressText,
      location: { type: 'Point', coordinates },
    };

    // Find single nearest approved pharmacy within 100km
    let nearestPharmacy = null;

    if (coordinates[0] !== 0 || coordinates[1] !== 0) {
      nearestPharmacy = await Pharmacy.findOne({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates },
            $maxDistance: 100000,
          },
        },
        approvalStatus: 'approved',
      }).lean() as any;
    }

    // Fallback: absolute nearest approved pharmacy
    if (!nearestPharmacy) {
      nearestPharmacy = await Pharmacy.findOne({ approvalStatus: 'approved' }).lean() as any;
    }

    if (nearestPharmacy) {
      prescription.nearbyPharmacies = [nearestPharmacy._id];
    }

    prescription.status = 'pending';
    await prescription.save();

    return successResponse(
      {
        order: {
          _id: prescription._id,
          id: prescription._id,
          orderNumber: `REQ-${prescription._id.toString().slice(-6).toUpperCase()}`,
          prescriptionId: prescription._id,
          status: 'pending',
          deliveryAddress: prescription.deliveryAddress,
          nearbyPharmaciesCount: nearestPharmacy ? 1 : 0,
        },
      },
      'Order created successfully',
      201
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return errorResponse('Failed to create order', 500);
  }
}
