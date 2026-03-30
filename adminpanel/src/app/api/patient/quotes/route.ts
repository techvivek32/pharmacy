import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Patient from '@/models/Patient';
import Pharmacy from '@/models/Pharmacy';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'patient') return unauthorizedResponse();

    await connectDB();

    const patient = await Patient.findOne({ userId: auth.userId }).lean() as any;
    if (!patient) return errorResponse('Patient not found', 404);

    const quotes = await Quote.find({
      patientId: patient._id,
      status: 'pending',
    }).sort({ createdAt: -1 }).lean() as any[];

    const formatted = await Promise.all(
      quotes.map(async (q: any) => {
        let pharmacyName = 'Unknown Pharmacy';
        let pharmacyPhone = '';
        try {
          const pharmacy = await Pharmacy.findById(q.pharmacyId).lean() as any;
          if (pharmacy) {
            pharmacyName = pharmacy.pharmacyName || 'Unknown Pharmacy';
            const pharmacyUser = await User.findById(pharmacy.userId).select('phone').lean() as any;
            pharmacyPhone = pharmacyUser?.phone || '';
          }
        } catch (_) {}

        return {
          id: q._id,
          prescriptionId: q.prescriptionId,
          pharmacyId: q.pharmacyId,
          pharmacyName,
          pharmacyPhone,
          items: q.items,
          subtotal: q.subtotal,
          deliveryFee: q.deliveryFee,
          totalAmount: q.totalAmount,
          status: q.status,
          expiresAt: q.expiresAt,
          createdAt: q.createdAt,
        };
      })
    );

    return successResponse({ quotes: formatted });
  } catch (error) {
    console.error('Get patient quotes error:', error);
    return errorResponse('Failed to fetch quotes', 500);
  }
}
