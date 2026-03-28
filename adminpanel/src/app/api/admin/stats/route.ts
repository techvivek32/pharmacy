import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Patient from '@/models/Patient';
import Pharmacy from '@/models/Pharmacy';
import Rider from '@/models/Rider';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const [
      totalOrders,
      totalPatients,
      totalPharmacies,
      totalRiders,
      activeOrders,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      Order.countDocuments(),
      Patient.countDocuments(),
      Pharmacy.countDocuments(),
      Rider.countDocuments(),
      Order.countDocuments({ 
        status: { $in: ['confirmed', 'preparing', 'picked_up', 'in_transit'] } 
      }),
      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
            status: 'delivered',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    return successResponse({
      totalOrders,
      totalPatients,
      totalPharmacies,
      totalRiders,
      activeOrders,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return errorResponse('Failed to fetch stats', 500);
  }
}
