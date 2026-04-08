import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Rider from '@/models/Rider';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'rider') return unauthorizedResponse();

    await connectDB();

    const { orderId } = await request.json();
    if (!orderId) return errorResponse('Order ID is required');

    const order = await Order.findById(orderId);
    if (!order) return errorResponse('Order not found', 404);

    // Only allow cancelling if this rider is assigned
    if (order.riderId) {
      const rider = await Rider.findOne({ userId: auth.userId });
      if (!rider || order.riderId.toString() !== rider._id.toString()) {
        return errorResponse('You are not assigned to this order');
      }
      // Unassign rider and revert status
      order.riderId = undefined;
      order.status = 'confirmed';
      await order.save();

      rider.isAvailable = true;
      await rider.save();
    }

    return successResponse({}, 'Order declined');
  } catch (error) {
    console.error('Cancel delivery error:', error);
    return errorResponse('Failed to cancel delivery', 500);
  }
}
