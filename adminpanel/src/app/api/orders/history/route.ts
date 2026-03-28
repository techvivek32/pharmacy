import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { successResponse, errorResponse } from '@/lib/response';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get userId from JWT token
    const authHeader = request.headers.get('authorization');
    let userId = request.nextUrl.searchParams.get('userId');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        userId = decoded.userId || decoded.id;
      } catch (error) {
        console.log('Token verification failed, using query param');
      }
    }

    if (!userId) {
      return successResponse([], 'No orders found');
    }

    // Find patient by userId
    const Patient = (await import('@/models/Patient')).default;
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return successResponse([], 'No orders found');
    }

    // Fetch all orders for the patient
    const orders = await Order.find({ patientId: patient._id })
      .sort({ createdAt: -1 })
      .populate('pharmacyId', 'pharmacyName name address')
      .populate('riderId', 'fullName name phone')
      .lean();

    // Normalize fields for Flutter app
    const normalized = orders.map((o: any) => ({
      ...o,
      id: o._id?.toString(),
      orderNumber: o.orderNumber || '',
      pharmacyName: o.pharmacyId?.pharmacyName || o.pharmacyId?.name || null,
      totalAmount: o.totalAmount || 0,
      status: o.status || 'pending',
    }));

    return successResponse(normalized, 'Orders fetched successfully');
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}
