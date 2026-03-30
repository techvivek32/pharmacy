import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Pharmacy from '@/models/Pharmacy';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { note } = await request.json();

    const pharmacy = await Pharmacy.findById(params.id);
    if (!pharmacy) return errorResponse('Pharmacy not found', 404);

    pharmacy.approvalStatus = 'rejected';
    pharmacy.adminNote = note || 'Your application was rejected.';
    await pharmacy.save();

    await User.findByIdAndUpdate(pharmacy.userId, { isActive: false });

    return successResponse({ message: 'Pharmacy rejected' });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to reject', 500);
  }
}
