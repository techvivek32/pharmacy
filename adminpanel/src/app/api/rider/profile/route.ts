import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Rider from '@/models/Rider';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'rider') return unauthorizedResponse();

    await connectDB();

    const rider = await Rider.findOne({ userId: auth.userId }).lean() as any;
    if (!rider) return errorResponse('Rider not found', 404);

    return successResponse({ rider });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to fetch rider profile', 500);
  }
}
