import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Pharmacy from '@/models/Pharmacy';
import Patient from '@/models/Patient';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'pharmacy') {
      return unauthorizedResponse();
    }

    await connectDB();

    // Get pharmacy
    const pharmacy = await Pharmacy.findOne({ userId: auth.userId });
    if (!pharmacy) {
      return errorResponse('Pharmacy profile not found', 404);
    }

    // Get pending prescriptions for this pharmacy
    const prescriptions = await Prescription.find({
      nearbyPharmacies: pharmacy._id,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'fullName phone' },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedPrescriptions = prescriptions.map((p: any) => ({
      id: p._id,
      imageUrl: p.imageUrl,
      patientName: p.patientId?.userId?.fullName || 'Unknown',
      patientPhone: p.patientId?.userId?.phone || '',
      deliveryAddress: p.deliveryAddress.address,
      distance: calculateDistance(pharmacy.location.coordinates, p.deliveryAddress.location.coordinates),
      createdAt: p.createdAt,
      expiresAt: p.expiresAt,
    }));

    return successResponse({ prescriptions: formattedPrescriptions });
  } catch (error: any) {
    console.error('Get requests error:', error);
    return errorResponse('Failed to fetch requests', 500);
  }
}

// Helper function to calculate distance
function calculateDistance(coords1: number[], coords2: number[]): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2[1] - coords1[1]);
  const dLon = toRad(coords2[0] - coords1[0]);
  const lat1 = toRad(coords1[1]);
  const lat2 = toRad(coords2[1]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}
