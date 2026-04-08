import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Rider from '@/models/Rider';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const riders = await Rider.find({ approvalStatus: 'approved' })
      .populate('userId', 'fullName email phone profileImage isActive createdAt')
      .sort({ createdAt: -1 })
      .lean() as any[];

    return successResponse({ riders, total: riders.length });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to fetch riders', 500);
  }
}
