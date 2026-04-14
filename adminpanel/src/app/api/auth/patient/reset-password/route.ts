import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyOTP } from '@/lib/otp-store';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await request.json();
    if (!email || !otp || !newPassword) {
      return errorResponse('Email, OTP and new password are required');
    }

    if (newPassword.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }

    const result = await verifyOTP(email, otp);
    if (!result.valid) return errorResponse(result.message);

    const user = await User.findOne({ email, role: 'patient' });
    if (!user) return errorResponse('No patient account found with this email');

    user.password = await hashPassword(newPassword);
    await user.save();

    return successResponse({}, 'Password reset successfully');
  } catch (error: any) {
    console.error('Patient reset password error:', error);
    return errorResponse('Failed to reset password', 500);
  }
}
