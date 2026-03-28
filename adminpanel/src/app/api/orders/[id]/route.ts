import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import '@/models/Patient';
import '@/models/User';
import '@/models/Pharmacy';
import '@/models/Rider';
import '@/models/Prescription';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return unauthorizedResponse();

    await connectDB();

    const order = await Order.findById(params.id)
      .populate('pharmacyId', 'pharmacyName address phone')
      .populate('riderId', 'fullName phone vehicleNumber')
      .populate('prescriptionId', 'imageUrl deliveryAddress createdAt')
      .lean() as any;

    if (!order) return errorResponse('Order not found', 404);

    const result = {
      ...order,
      id: order._id?.toString(),
      orderNumber: order.orderNumber || '',
      pharmacyName: order.pharmacyId?.pharmacyName || null,
      pharmacyPhone: order.pharmacyId?.phone || null,
      prescriptionImage: order.prescriptionId?.imageUrl || null,
      deliveryAddress: order.deliveryAddress || order.prescriptionId?.deliveryAddress || null,
      rider: order.riderId ? {
        id: order.riderId._id?.toString(),
        name: order.riderId.fullName || '',
        phone: order.riderId.phone || '',
        vehicleNumber: order.riderId.vehicleNumber || null,
      } : null,
    };

    return successResponse({ order: result });
  } catch (error: any) {
    console.error('Get order error:', error?.message || error);
    return errorResponse('Failed to fetch order', 500);
  }
}
