import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/response';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return errorResponse('Patient not found', 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(
      {
        patient: {
          id: user._id,
          isActive: user.isActive,
        },
      },
      `Patient ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error: any) {
    console.error('Toggle patient status error:', error);
    return errorResponse('Failed to toggle patient status', 500);
  }
}
