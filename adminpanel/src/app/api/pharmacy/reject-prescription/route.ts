import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Pharmacy from '@/models/Pharmacy';
import Quote from '@/models/Quote';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { reassignPrescriptionToNextPharmacy } from '@/services/reassignment';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'pharmacy') return unauthorizedResponse();

    await connectDB();

    const { prescriptionId, reason } = await request.json();
    if (!prescriptionId) return errorResponse('prescriptionId is required');

    // Get current pharmacy
    const pharmacy = await Pharmacy.findOne({ userId: auth.userId }).lean() as any;
    if (!pharmacy) return errorResponse('Pharmacy not found', 404);

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) return errorResponse('Prescription not found', 404);

    // Create a rejected quote record so this pharmacy is excluded from future reassignments
    await Quote.create({
      prescriptionId: prescription._id,
      patientId: prescription.patientId,
      pharmacyId: pharmacy._id,
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      totalAmount: 0,
      status: 'rejected',
      rejectionReason: reason || 'Rejected by pharmacy',
    });

    // Reassign to next nearest untried approved pharmacy (notifies the new
    // pharmacy and the patient)
    const reassigned = await reassignPrescriptionToNextPharmacy(prescription);

    if (reassigned) {
      return successResponse({ reassigned: true }, 'Prescription rejected and reassigned to next pharmacy');
    } else {
      prescription.nearbyPharmacies = [];
      prescription.status = 'pending';
      await prescription.save();

      return successResponse({ reassigned: false }, 'Prescription rejected. No more pharmacies available.');
    }
  } catch (error) {
    console.error('Reject prescription error:', error);
    return errorResponse('Failed to reject prescription', 500);
  }
}
