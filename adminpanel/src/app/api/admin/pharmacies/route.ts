import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Pharmacy from '@/models/Pharmacy';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Get all users with role 'pharmacy'
    const userQuery: any = { role: 'pharmacy' };
    if (search) {
      userQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(userQuery).select('-password').lean();

    // Get pharmacy details
    const pharmaciesWithDetails = await Promise.all(
      users.map(async (user) => {
        const pharmacy = await Pharmacy.findOne({ userId: user._id }).lean();
        return {
          id: user._id,
          name: (pharmacy as any)?.pharmacyName || user.fullName,
          email: user.email,
          phone: user.phone,
          licenseNumber: (pharmacy as any)?.licenseNumber || 'N/A',
          address: (pharmacy as any)?.address || 'N/A',
          totalOrders: (pharmacy as any)?.totalOrders || 0,
          rating: (pharmacy as any)?.rating || 0,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        };
      })
    );

    return successResponse({
      pharmacies: pharmaciesWithDetails,
      total: pharmaciesWithDetails.length,
    });
  } catch (error: any) {
    console.error('Fetch pharmacies error:', error);
    return errorResponse('Failed to fetch pharmacies', 500);
  }
}
