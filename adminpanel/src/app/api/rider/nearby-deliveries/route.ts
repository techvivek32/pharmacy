import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Rider from '@/models/Rider';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'rider') return unauthorizedResponse();

    await connectDB();

    const rider = await Rider.findOne({ userId: auth.userId });
    if (!rider) return errorResponse('Rider profile not found', 404);

    // Fetch all unassigned confirmed/ready orders
    // riderId: null covers both missing field and explicitly null
    const orders = await Order.find({
      status: { $in: ['confirmed', 'ready'] },
      $or: [{ riderId: { $exists: false } }, { riderId: null }],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean() as any[];

    const riderHasLocation =
      rider.currentLocation?.coordinates?.length === 2 &&
      (rider.currentLocation.coordinates[0] !== 0 || rider.currentLocation.coordinates[1] !== 0);

    const result = orders
      .map((order: any) => {
        let distanceKm: number | null = null;

        if (riderHasLocation) {
          const pharmCoords = order.pharmacyAddress?.location?.coordinates;
          if (pharmCoords?.length === 2) {
            distanceKm = calcDistance(
              rider.currentLocation.coordinates[1], // rider lat
              rider.currentLocation.coordinates[0], // rider lng
              pharmCoords[1],                        // pharmacy lat
              pharmCoords[0]                         // pharmacy lng
            );
            // Filter out orders more than 10km away
            if (distanceKm > 10) return null;
          }
        }

        return {
          orderId: order._id,
          orderNumber: order.orderNumber,
          pickupAddress: order.pharmacyAddress?.address || '',
          deliveryAddress: order.deliveryAddress?.address || '',
          pharmacyCoords: order.pharmacyAddress?.location?.coordinates || null,
          deliveryCoords: order.deliveryAddress?.location?.coordinates || null,
          distance: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
          deliveryFee: order.deliveryFee || 0,
          totalAmount: order.totalAmount || 0,
          status: order.status,
          createdAt: order.createdAt,
        };
      })
      .filter(Boolean);

    return successResponse({ deliveries: result });
  } catch (error: any) {
    console.error('Get nearby deliveries error:', error);
    return errorResponse('Failed to fetch deliveries', 500);
  }
}

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(v: number) {
  return (v * Math.PI) / 180;
}
