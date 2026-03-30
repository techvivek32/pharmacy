import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Pharmacy from '@/models/Pharmacy';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const pharmacies = await Pharmacy.find({ approvalStatus: status })
      .populate('userId', 'fullName email phone createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ requests: pharmacies, total: pharmacies.length });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to fetch requests', 500);
  }
}
