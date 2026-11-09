import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Pharmacy from '@/models/Pharmacy';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

// Per-pharmacy revenue for a chosen period, based on DELIVERED orders.
// Used to settle what each pharmacy owes the platform (the service fees).
// GET /api/admin/pharmacy-revenue?from=2026-11-01&to=2026-11-30
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Default: current month
    const now = new Date();
    const from = fromParam ? new Date(fromParam) : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = toParam ? new Date(toParam) : now;
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return errorResponse('Invalid from/to date');
    }
    // Include the whole "to" day
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);

    const rows = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          pharmacyId: { $ne: null },
          $or: [
            { deliveredAt: { $gte: from, $lte: toEnd } },
            { deliveredAt: null, createdAt: { $gte: from, $lte: toEnd } },
          ],
        },
      },
      {
        $group: {
          _id: '$pharmacyId',
          orders: { $sum: 1 },
          medicinesRevenue: { $sum: { $ifNull: ['$subtotal', 0] } },
          serviceFees: { $sum: { $ifNull: ['$commissionAmount', 0] } },
          deliveryFees: { $sum: { $ifNull: ['$deliveryFee', 0] } },
          totalCollected: { $sum: { $ifNull: ['$totalAmount', 0] } },
        },
      },
      { $sort: { medicinesRevenue: -1 } },
    ]);

    // Attach pharmacy name + owner phone
    const result = await Promise.all(
      rows.map(async (r: any) => {
        let pharmacyName = 'Unknown Pharmacy';
        let phone = '';
        try {
          const pharmacy = await Pharmacy.findById(r._id).lean() as any;
          if (pharmacy) {
            pharmacyName = pharmacy.pharmacyName || pharmacyName;
            const user = await User.findById(pharmacy.userId).select('phone').lean() as any;
            phone = user?.phone || '';
          }
        } catch (_) {}
        return {
          pharmacyId: r._id,
          pharmacyName,
          phone,
          orders: r.orders,
          medicinesRevenue: Math.round(r.medicinesRevenue * 100) / 100,
          serviceFees: Math.round(r.serviceFees * 100) / 100,
          deliveryFees: Math.round(r.deliveryFees * 100) / 100,
          totalCollected: Math.round(r.totalCollected * 100) / 100,
        };
      })
    );

    const totals = result.reduce(
      (t, r) => ({
        orders: t.orders + r.orders,
        medicinesRevenue: t.medicinesRevenue + r.medicinesRevenue,
        serviceFees: t.serviceFees + r.serviceFees,
        deliveryFees: t.deliveryFees + r.deliveryFees,
        totalCollected: t.totalCollected + r.totalCollected,
      }),
      { orders: 0, medicinesRevenue: 0, serviceFees: 0, deliveryFees: 0, totalCollected: 0 }
    );

    return successResponse({
      from: from.toISOString(),
      to: toEnd.toISOString(),
      pharmacies: result,
      totals,
    });
  } catch (error) {
    console.error('Pharmacy revenue error:', error);
    return errorResponse('Failed to compute pharmacy revenue', 500);
  }
}
