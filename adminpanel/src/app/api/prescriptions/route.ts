import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate('patientId', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Prescription.countDocuments(query),
    ]);

    return successResponse({
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get prescriptions error:', error);
    return errorResponse('Failed to fetch prescriptions', 500);
  }
}
