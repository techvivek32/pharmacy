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

    // Base query: unassigned orders ready for pickup
    const baseQuery: any = {
      status: { $in: ['ready', 'confirmed'] },
      riderId: { $exists: false },
    };

    let orders: any[] = [];

    // If rider has a live location, use geo query to find orders within 10km of rider
    if (rider.currentLocation?.coordinates?.length === 2) {
      const [riderLng, riderLat] = rider.currentLocation.coordinates;

      // Use $geoNear aggregation for distance calculation
      orders = await Order.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [riderLng, riderLat] },
            distanceField: 'distanceMeters',
            maxDistance: 10000, // 10km
            spherical: true,
            query: baseQuery,
            key: 'pharmacyAddress.location',
          },
        },
        { $sort: { distanceMeters: 1 } },
        { $limit: 20 },
      ]);
    } else {
      // No location yet — return all available orders so rider can still see them
      orders = await Order.find(baseQuery)
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
    }

    const result = orders.map((order: any) => {
      const distanceKm = order.distanceMeters != null
        ? Math.round(order.distanceMeters / 100) / 10
        : null;

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        pickupAddress: order.pharmacyAddress?.address || '',
        deliveryAddress: order.deliveryAddress?.address || '',
        pharmacyCoords: order.pharmacyAddress?.location?.coordinates || null,
        deliveryCoords: order.deliveryAddress?.location?.coordinates || null,
        distance: distanceKm,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      };
    });

    return successResponse({ deliveries: result });
  } catch (error: any) {
    console.error('Get nearby deliveries error:', error);
    return errorResponse('Failed to fetch deliveries', 500);
  }
}
