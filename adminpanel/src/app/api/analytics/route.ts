import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Patient from '@/models/Patient';
import Pharmacy from '@/models/Pharmacy';
import Rider from '@/models/Rider';
import Prescription from '@/models/Prescription';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get counts
    const [
      totalOrders,
      totalPatients,
      totalPharmacies,
      totalRiders,
      totalPrescriptions,
      activeOrders,
      completedOrders,
      totalRevenue,
    ] = await Promise.all([
      Order.countDocuments(),
      Patient.countDocuments(),
      Pharmacy.countDocuments(),
      Rider.countDocuments(),
      Prescription.countDocuments(),
      Order.countDocuments({ status: { $in: ['confirmed', 'preparing', 'picked_up', 'in_transit'] } }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    // Get recent orders for chart data
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get order status breakdown
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top pharmacies
    const topPharmacies = await Order.aggregate([
      {
        $match: { status: 'delivered' },
      },
      {
        $group: {
          _id: '$pharmacyId',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { orders: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'pharmacies',
          localField: '_id',
          foreignField: '_id',
          as: 'pharmacy',
        },
      },
      { $unwind: '$pharmacy' },
      {
        $project: {
          name: '$pharmacy.pharmacyName',
          orders: 1,
          revenue: 1,
        },
      },
    ]);

    // Get top riders
    const topRiders = await Order.aggregate([
      {
        $match: { status: 'delivered', riderId: { $exists: true } },
      },
      {
        $group: {
          _id: '$riderId',
          deliveries: { $sum: 1 },
          earnings: { $sum: '$deliveryFee' },
        },
      },
      { $sort: { deliveries: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'riders',
          localField: '_id',
          foreignField: '_id',
          as: 'rider',
        },
      },
      { $unwind: '$rider' },
      {
        $project: {
          name: '$rider.fullName',
          deliveries: 1,
          earnings: 1,
        },
      },
    ]);

    return successResponse({
      overview: {
        totalOrders,
        totalPatients,
        totalPharmacies,
        totalRiders,
        totalPrescriptions,
        activeOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      charts: {
        recentOrders,
        ordersByStatus,
      },
      topPerformers: {
        pharmacies: topPharmacies,
        riders: topRiders,
      },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
