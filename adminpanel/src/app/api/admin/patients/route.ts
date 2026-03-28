import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = { role: 'patient' };
    if (search) {
      searchQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await User.countDocuments(searchQuery);

    // Get patients with pagination
    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get patient details (addresses, orders count)
    const patientsWithDetails = await Promise.all(
      users.map(async (user) => {
        const patient = await Patient.findOne({ userId: user._id });
        return {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          isVerified: user.isVerified,
          totalOrders: patient?.totalOrders || 0,
          addressCount: patient?.addresses?.length || 0,
          createdAt: user.createdAt,
        };
      })
    );

    return successResponse({
      patients: patientsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get patients error:', error);
    return errorResponse('Failed to get patients', 500);
  }
}
