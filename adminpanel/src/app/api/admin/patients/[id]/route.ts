import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Order from '@/models/Order';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return errorResponse('Patient not found', 404);
    }

    const patient = await Patient.findOne({ userId: params.id });
    const orders = await Order.find({ patientId: params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse({
      patient: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        addresses: patient?.addresses || [],
        totalOrders: patient?.totalOrders || 0,
        recentOrders: orders,
      },
    });
  } catch (error: any) {
    console.error('Get patient details error:', error);
    return errorResponse('Failed to get patient details', 500);
  }
}
