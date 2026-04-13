import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Patient from '@/models/Patient';
import User from '@/models/User';
import Quote from '@/models/Quote';
import Pharmacy from '@/models/Pharmacy';
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

      // Get full quote history with pharmacy names and rejection details
      let quotesCount = 0;
      let acceptedQuotes = 0;
      let rejectedQuotes = 0;
      let quoteHistory: any[] = [];
      try {
        const quotes = await Quote.find({ prescriptionId: p._id }).sort({ createdAt: 1 }).lean() as any[];
        quotesCount = quotes.length;
        acceptedQuotes = quotes.filter((q: any) => q.status === 'accepted').length;
        rejectedQuotes = quotes.filter((q: any) => q.status === 'rejected').length;

        quoteHistory = await Promise.all(quotes.map(async (q: any) => {
          let pharmacyName = 'Unknown Pharmacy';
          try {
            const ph = await Pharmacy.findById(q.pharmacyId).lean() as any;
            pharmacyName = ph?.pharmacyName || 'Unknown Pharmacy';
          } catch (_) {}

          // Determine who rejected:
          // - has rejectionReason → pharmacy rejected
          // - no rejectionReason + status rejected → patient cancelled
          const rejectedBy = q.status === 'rejected'
            ? (q.rejectionReason ? 'pharmacy' : 'patient')
            : null;

          return {
            pharmacyName,
            status: q.status,
            rejectedBy,
            rejectionReason: q.rejectionReason || '',
            totalAmount: q.totalAmount || 0,
            subtotal: q.subtotal || 0,
            deliveryFee: q.deliveryFee || 0,
            items: q.items || [],
            createdAt: q.createdAt,
          };
        }));
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
        quoteHistory,
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
