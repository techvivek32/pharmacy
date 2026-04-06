import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne().lean() as any;
    return successResponse({
      keyId: settings?.razorpayKeyId || '',
    });
  } catch (error: any) {
    console.error('Get razorpay key error:', error);
    return errorResponse('Failed to fetch payment config', 500);
  }
}
