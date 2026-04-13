import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import '@/models/Patient';
import User from '@/models/User';
import '@/models/Pharmacy';
import Rider from '@/models/Rider';
import '@/models/Prescription';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);

    const rawOrders = await Order.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'fullName email phone profileImage' },
      })
      .populate('pharmacyId', 'pharmacyName address phone')
      .populate({ path: 'riderId', model: Rider })
      .populate('prescriptionId', 'imageUrl deliveryAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as any[];

    // Normalize — fetch rider name from User model
    const orders = await Promise.all(rawOrders.map(async (o: any) => {
      const user = o.patientId?.userId;

      let riderName = 'Unassigned';
      if (o.riderId?.userId) {
        try {
          const riderUser = await User.findById(o.riderId.userId).select('fullName').lean() as any;
          if (riderUser?.fullName) riderName = riderUser.fullName;
        } catch (_) {}
      }

      return {
        ...o,
        patientName: user?.fullName || null,
        patientEmail: user?.email || null,
        patientPhone: user?.phone || null,
        patientImage: user?.profileImage || null,
        riderName,
      };
    }));

    return successResponse({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Get orders error:', error?.message || error);
    return errorResponse(`Failed to fetch orders: ${error?.message}`, 500);
  }
}
