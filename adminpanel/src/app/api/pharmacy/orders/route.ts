import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Pharmacy from '@/models/Pharmacy';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'pharmacy') return unauthorizedResponse();

    await connectDB();

    const pharmacy = await Pharmacy.findOne({ userId: auth.userId });
    if (!pharmacy) return errorResponse('Pharmacy not found', 404);

    const orders = await Order.find({ pharmacyId: pharmacy._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = orders.map((o: any) => ({
      id: o._id,
      orderNumber: o.orderNumber,
      status: o.status,
      subtotal: o.subtotal,
      totalAmount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      items: o.items,
      createdAt: o.createdAt,
    }));

    return successResponse({ orders: formatted });
  } catch (error: any) {
    return errorResponse('Failed to fetch orders', 500);
  }
}
