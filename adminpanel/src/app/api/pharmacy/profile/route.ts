import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Pharmacy from '@/models/Pharmacy';
import { authenticateRequest, hashPassword, verifyPassword } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'pharmacy') return unauthorizedResponse();

    await connectDB();

    const user = await User.findById(auth.userId).select('-password');
    if (!user) return errorResponse('User not found', 404);

    const pharmacy = await Pharmacy.findOne({ userId: auth.userId });

    return successResponse({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
      },
      pharmacy: pharmacy ? {
        pharmacyName: pharmacy.pharmacyName,
        licenseNumber: pharmacy.licenseNumber,
        address: pharmacy.address,
        location: pharmacy.location,
        isOpen: pharmacy.isOpen,
        rating: pharmacy.rating,
        totalOrders: pharmacy.totalOrders,
      } : null,
    });
  } catch (error: any) {
    return errorResponse('Failed to fetch profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'pharmacy') return unauthorizedResponse();

    await connectDB();

    const body = await request.json();
    const { fullName, phone, currentPassword, newPassword } = body;

    const user = await User.findById(auth.userId).select('+password');
    if (!user) return errorResponse('User not found', 404);

    // Change password flow
    if (currentPassword && newPassword) {
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) return errorResponse('Current password is incorrect', 400);
      user.password = await hashPassword(newPassword);
      await user.save();
      return successResponse({}, 'Password updated successfully');
    }

    // Update profile
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    await user.save();

    return successResponse({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    }, 'Profile updated successfully');
  } catch (error: any) {
    return errorResponse('Failed to update profile', 500);
  }
}
