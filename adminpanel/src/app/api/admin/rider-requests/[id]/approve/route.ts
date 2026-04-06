import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Rider from '@/models/Rider';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const rider = await Rider.findByIdAndUpdate(
      params.id,
      { approvalStatus: 'approved' },
      { new: true }
    );
    if (!rider) return errorResponse('Rider not found', 404);
    await User.findByIdAndUpdate(rider.userId, { isActive: true });
    return successResponse({ message: 'Rider approved successfully' });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to approve rider', 500);
  }
}
