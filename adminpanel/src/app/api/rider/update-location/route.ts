import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Rider from '@/models/Rider';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'rider') return unauthorizedResponse();

    await connectDB();

    const { lat, lng, isOnline } = await request.json();

    if (lat === undefined || lng === undefined) {
      return errorResponse('lat and lng are required');
    }

    const update: any = {
      currentLocation: {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
      },
    };

    if (isOnline !== undefined) {
      update.isOnline = isOnline;
      update.isAvailable = isOnline;
    }

    await Rider.findOneAndUpdate(
      { userId: auth.userId },
      { $set: update }
    );

    return successResponse({}, 'Location updated');
  } catch (error) {
    console.error('Update location error:', error);
    return errorResponse('Failed to update location', 500);
  }
}
