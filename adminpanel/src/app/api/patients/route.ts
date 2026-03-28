import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all users with role 'patient'
    const users = await User.find({ role: 'patient' })
      .select('fullName email phone createdAt isVerified')
      .sort({ createdAt: -1 })
      .lean();

    // Get patient profiles with order counts
    const patientsWithDetails = await Promise.all(
      users.map(async (user) => {
        const patient = await Patient.findOne({ userId: user._id }).lean();
        
        // TODO: Get actual order count from Orders collection
        const totalOrders = 0;

        return {
          id: (user._id as any).toString(),
          name: user.fullName,
          email: user.email,
          phone: user.phone,
          totalOrders,
          status: user.isVerified ? 'active' : 'inactive',
          joinedDate: new Date(user.createdAt).toISOString().split('T')[0],
          addresses: (patient as any)?.addresses || [],
        };
      })
    );

    return successResponse({
      patients: patientsWithDetails,
      total: patientsWithDetails.length,
    });
  } catch (error: any) {
    console.error('Fetch patients error:', error);
    return errorResponse('Failed to fetch patients', 500);
  }
}
