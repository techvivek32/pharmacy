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
      // Return empty array instead of error for better UX
      return successResponse([], 'No orders found');
    }

    // Fetch orders for the user
    const orders = await Order.find({ patientId: userId })
      .sort({ createdAt: -1 })
      .populate('pharmacyId', 'name address')
      .populate('riderId', 'name phone')
      .lean();

    return successResponse(orders, 'Orders fetched successfully');
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}
