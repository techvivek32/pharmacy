import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Patient from '@/models/Patient';
import User from '@/models/User';
import Quote from '@/models/Quote';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [rawPrescriptions, total] = await Promise.all([
      Prescription.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Prescription.countDocuments(query),
    ]);

    const prescriptions = await Promise.all(rawPrescriptions.map(async (p: any) => {
      // Get patient name/phone via Patient → User
      let patientName = 'Unknown';
      let patientPhone = '';
      let patientEmail = '';
      try {
        const patient = await Patient.findById(p.patientId).lean() as any;
        if (patient?.userId) {
          const user = await User.findById(patient.userId).select('fullName phone email').lean() as any;
          patientName = user?.fullName || 'Unknown';
          patientPhone = user?.phone || '';
          patientEmail = user?.email || '';
        }
      } catch (_) {}

      // Count quotes for this prescription
      let quotesCount = 0;
      let acceptedQuotes = 0;
      let rejectedQuotes = 0;
      try {
        const quotes = await Quote.find({ prescriptionId: p._id }).lean() as any[];
        quotesCount = quotes.length;
        acceptedQuotes = quotes.filter((q: any) => q.status === 'accepted').length;
        rejectedQuotes = quotes.filter((q: any) => q.status === 'rejected').length;
      } catch (_) {}

      return {
        _id: p._id?.toString(),
        patientName,
        patientPhone,
        patientEmail,
        imageUrl: p.imageUrl || '',
        medicines: p.medicines || [],
        status: p.status,
        deliveryAddress: p.deliveryAddress?.address || '',
        quotesCount,
        acceptedQuotes,
        rejectedQuotes,
        createdAt: p.createdAt,
        expiresAt: p.expiresAt,
      };
    }));

    return successResponse({
      prescriptions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Get prescriptions error:', error);
    return errorResponse('Failed to fetch prescriptions', 500);
  }
}
