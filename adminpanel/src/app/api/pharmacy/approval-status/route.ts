import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Pharmacy from '@/models/Pharmacy';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) return errorResponse('Unauthorized', 401);

    await connectDB();
    const pharmacy = await Pharmacy.findOne({ userId: payload.userId }).lean() as any;
    if (!pharmacy) return errorResponse('Pharmacy not found', 404);

    return successResponse({
      approvalStatus: pharmacy.approvalStatus,
      adminNote: pharmacy.adminNote || '',
    });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to fetch status', 500);
  }
}
