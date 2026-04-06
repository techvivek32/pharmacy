import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Rider from '@/models/Rider';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const riders = await Rider.find({ approvalStatus: status })
      .populate('userId', 'fullName email phone createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ requests: riders, total: riders.length });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to fetch rider requests', 500);
  }
}
