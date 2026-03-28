import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Rider from '@/models/Rider';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'rider') {
      return unauthorizedResponse();
    }

    await connectDB();

    // Get rider
    const rider = await Rider.findOne({ userId: auth.userId });
    if (!rider) {
      return errorResponse('Rider profile not found', 404);
    }

    if (!rider.currentLocation) {
      return errorResponse('Please update your location first');
    }

    // Find nearby orders that need delivery
    const orders = await Order.find({
      status: { $in: ['ready', 'confirmed'] },
      riderId: { $exists: false },
    })
      .populate('pharmacyId')
      .populate('patientId')
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate distance and filter
    const nearbyOrders = orders
      .map((order: any) => {
        const distance = calculateDistance(
          rider.currentLocation!.coordinates,
          order.pharmacyAddress.location.coordinates
        );

        if (distance > 10) return null; // Only show orders within 10km

        return {
          orderId: order._id,
          orderNumber: order.orderNumber,
          pickupAddress: order.pharmacyAddress.address,
          deliveryAddress: order.deliveryAddress.address,
          distance: distance,
          deliveryFee: order.deliveryFee,
          status: order.status,
          createdAt: order.createdAt,
        };
      })
      .filter(Boolean);

    return successResponse({ deliveries: nearbyOrders });
  } catch (error: any) {
    console.error('Get nearby deliveries error:', error);
    return errorResponse('Failed to fetch deliveries', 500);
  }
}

function calculateDistance(coords1: number[], coords2: number[]): number {
  const R = 6371;
  const dLat = toRad(coords2[1] - coords1[1]);
  const dLon = toRad(coords2[0] - coords1[0]);
  const lat1 = toRad(coords1[1]);
  const lat2 = toRad(coords2[1]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}
