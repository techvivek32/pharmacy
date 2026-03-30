import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Prescription from '@/models/Prescription';
import Pharmacy from '@/models/Pharmacy';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'patient') return unauthorizedResponse();

    await connectDB();

    const quote = await Quote.findById(params.id);
    if (!quote) return errorResponse('Quote not found', 404);
    if (quote.status !== 'pending') return errorResponse('Quote already processed');

    // Mark quote as rejected
    quote.status = 'rejected';
    await quote.save();

    const prescription = await Prescription.findById(quote.prescriptionId);
    if (!prescription) return errorResponse('Prescription not found', 404);

    // Get all pharmacies already tried (current + previously rejected)
    const rejectedQuotes = await Quote.find({
      prescriptionId: prescription._id,
      status: { $in: ['rejected', 'accepted'] },
    }).lean() as any[];

    const triedPharmacyIds = rejectedQuotes.map((q: any) => q.pharmacyId.toString());

    // Find next nearest pharmacy not yet tried
    let nextPharmacy = null;

    if (prescription.deliveryAddress?.location?.coordinates?.length === 2) {
      nextPharmacy = await Pharmacy.findOne({
        _id: { $nin: triedPharmacyIds },
        approvalStatus: 'approved',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: prescription.deliveryAddress.location.coordinates,
            },
          },
        },
      }).lean() as any;
    } else {
      // No coordinates — pick any untried approved pharmacy
      nextPharmacy = await Pharmacy.findOne({
        _id: { $nin: triedPharmacyIds },
        approvalStatus: 'approved',
      }).lean() as any;
    }

    if (nextPharmacy) {
      // Reassign prescription to next pharmacy
      prescription.nearbyPharmacies = [nextPharmacy._id];
      prescription.status = 'pending';
      await prescription.save();

      return successResponse({
        reassigned: true,
        message: 'Quote cancelled. Request sent to next nearest pharmacy.',
      });
    } else {
      // No more pharmacies available
      prescription.status = 'pending';
      prescription.nearbyPharmacies = [];
      await prescription.save();

      return successResponse({
        reassigned: false,
        message: 'Quote cancelled. No more pharmacies available nearby.',
      });
    }
  } catch (error) {
    console.error('Cancel quote error:', error);
    return errorResponse('Failed to cancel quote', 500);
  }
}
