import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Patient from '@/models/Patient';
import Pharmacy from '@/models/Pharmacy';
import Rider from '@/models/Rider';
import User from '@/models/User';
import Prescription from '@/models/Prescription';
import Quote from '@/models/Quote';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const now = new Date();
    const last30 = new Date(now); last30.setDate(now.getDate() - 30);
    const last7 = new Date(now); last7.setDate(now.getDate() - 7);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, totalPatients, totalPharmacies, totalRiders,
      totalPrescriptions, activeOrders, completedOrders,
      cancelledOrders, totalQuotes,
      revenueAgg, thisMonthRevenueAgg, lastMonthRevenueAgg,
      thisMonthOrders, lastMonthOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Patient.countDocuments(),
      Pharmacy.countDocuments({ approvalStatus: 'approved' }),
      Rider.countDocuments({ approvalStatus: 'approved' }),
      Prescription.countDocuments(),
      Order.countDocuments({ status: { $in: ['confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'in_transit'] } }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Quote.countDocuments(),
      Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { status: 'delivered', createdAt: { $gte: thisMonthStart } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { status: 'delivered', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Order.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const thisMonthRevenue = thisMonthRevenueAgg[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.total || 0;

    const revenueGrowth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;
    const ordersGrowth = lastMonthOrders > 0
      ? Math.round(((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : 0;

    // Last 7 days daily orders + revenue
    const dailyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: last7 } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      }},
      { $sort: { _id: 1 } },
    ]);

    // Last 30 days daily for chart
    const last30Stats = await Order.aggregate([
      { $match: { createdAt: { $gte: last30 } } },
      { $group: {
        _id: { $dateToString: { format: '%m/%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      }},
      { $sort: { _id: 1 } },
    ]);

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top pharmacies by delivered orders
    const topPharmacies = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: '$pharmacyId', orders: { $sum: 1 }, revenue: { $sum: '$subtotal' } } },
      { $sort: { orders: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'pharmacies', localField: '_id', foreignField: '_id', as: 'pharmacy' } },
      { $unwind: '$pharmacy' },
      { $project: { name: '$pharmacy.pharmacyName', orders: 1, revenue: 1 } },
    ]);

    // Top riders — join Rider → User for name
    const topRidersRaw = await Order.aggregate([
      { $match: { status: 'delivered', riderId: { $exists: true, $ne: null } } },
      { $group: { _id: '$riderId', deliveries: { $sum: 1 }, earnings: { $sum: '$deliveryFee' } } },
      { $sort: { deliveries: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'riders', localField: '_id', foreignField: '_id', as: 'rider' } },
      { $unwind: { path: '$rider', preserveNullAndEmpty: true } },
    ]);

    const topRiders = await Promise.all(topRidersRaw.map(async (r: any) => {
      let name = 'Unknown Rider';
      try {
        if (r.rider?.userId) {
          const u = await User.findById(r.rider.userId).select('fullName').lean() as any;
          name = u?.fullName || name;
        }
      } catch (_) {}
      return { name, deliveries: r.deliveries, earnings: r.earnings };
    }));

    // Prescription status breakdown
    const prescriptionsByStatus = await Prescription.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return successResponse({
      overview: {
        totalOrders, totalPatients, totalPharmacies, totalRiders,
        totalPrescriptions, activeOrders, completedOrders, cancelledOrders,
        totalQuotes, totalRevenue, thisMonthRevenue, lastMonthRevenue,
        revenueGrowth, ordersGrowth, thisMonthOrders, lastMonthOrders,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      },
      charts: { dailyStats, last30Stats, ordersByStatus, prescriptionsByStatus },
      topPerformers: { pharmacies: topPharmacies, riders: topRiders },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
