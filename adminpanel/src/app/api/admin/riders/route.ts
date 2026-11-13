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

    // A rider's `isOnline` flag can get stuck "true" if the app is killed or
    // loses connection without tapping Offline. The app pings every 30s while
    // online, so treat a rider as truly online only if their record was
    // updated within the last 2 minutes. This keeps the admin status accurate.
    const ONLINE_WINDOW_MS = 2 * 60 * 1000;
    const now = Date.now();
    const result = riders.map((r: any) => {
      const lastUpdate = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
      const liveOnline = r.isOnline === true && now - lastUpdate < ONLINE_WINDOW_MS;
      return { ...r, isOnline: liveOnline };
    });

    return successResponse({ riders: result, total: result.length });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to fetch riders', 500);
  }
}
