import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Rider from '@/models/Rider';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { note } = await request.json().catch(() => ({ note: '' }));
    const rider = await Rider.findByIdAndUpdate(
      params.id,
      { approvalStatus: 'rejected', adminNote: note },
      { new: true }
    );
    if (!rider) return errorResponse('Rider not found', 404);
    return successResponse({ message: 'Rider rejected' });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to reject rider', 500);
  }
}
