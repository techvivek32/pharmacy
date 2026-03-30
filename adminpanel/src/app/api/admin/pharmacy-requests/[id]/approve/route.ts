import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Pharmacy from '@/models/Pharmacy';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const pharmacy = await Pharmacy.findById(params.id);
    if (!pharmacy) return errorResponse('Pharmacy not found', 404);

    pharmacy.approvalStatus = 'approved';
    pharmacy.adminNote = '';
    await pharmacy.save();

    await User.findByIdAndUpdate(pharmacy.userId, { isActive: true, isVerified: true });

    return successResponse({ message: 'Pharmacy approved successfully' });
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to approve', 500);
  }
}
