import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Rider from '@/models/Rider';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { sendNotificationToUser } from '@/services/notification';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'rider') {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return errorResponse('Order ID is required');
    }

    // Get rider
    const rider = await Rider.findOne({ userId: auth.userId });
    if (!rider) {
      return errorResponse('Rider profile not found', 404);
    }

    if (!rider.isAvailable) {
      return errorResponse('You are not available for deliveries');
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse('Order not found', 404);
    }

    if (order.riderId) {
      return errorResponse('Order already assigned to another rider');
    }

    if (!['confirmed', 'ready'].includes(order.status)) {
      return errorResponse('Order is not available for pickup');
    }

    // Assign rider to order
    order.riderId = rider._id;
    order.status = 'assigned';
    await order.save();

    // Update rider availability
    rider.isAvailable = false;
    await rider.save();

    // Notify patient
    await sendNotificationToUser(
      order.patientId.toString(),
      'Rider Assigned',
      'A rider has been assigned to your order and will pick it up soon.',
      {
        orderId: order._id.toString(),
        type: 'rider_assigned',
      }
    );

    // Notify pharmacy
    await sendNotificationToUser(
      order.pharmacyId.toString(),
      'Rider on the Way',
      `Rider is coming to pick up order ${order.orderNumber}`,
      {
        orderId: order._id.toString(),
        type: 'rider_coming',
      }
    );

    return successResponse({
      order: {
        orderNumber: order.orderNumber,
        pickupLocation: order.pharmacyAddress.location.coordinates,
        deliveryLocation: order.deliveryAddress.location.coordinates,
        pickupAddress: order.pharmacyAddress.address,
        deliveryAddress: order.deliveryAddress.address,
      },
    });
  } catch (error: any) {
    console.error('Accept delivery error:', error);
    return errorResponse('Failed to accept delivery', 500);
  }
}
