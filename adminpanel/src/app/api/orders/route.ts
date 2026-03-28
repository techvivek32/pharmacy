import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'fullName email phone profileImage' },
        })
        .populate('pharmacyId', 'pharmacyName address phone')
        .populate('riderId', 'fullName phone')
        .populate('prescriptionId', 'imageUrl deliveryAddress')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .catch(() => []),
      Order.countDocuments(query).catch(() => 0),
    ]);

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil((total as number) / limit),
      },
    });
  } catch (error: any) {
    console.error('Get orders error:', error?.message || error);
    return errorResponse(`Failed to fetch orders: ${error?.message || 'Unknown error'}`, 500);
  }
}
