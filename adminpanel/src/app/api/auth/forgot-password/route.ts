import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/response';
import { generateOTP, storeOTP } from '@/lib/otp-store';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();
    if (!email) return errorResponse('Email is required');

    // Check user exists with pharmacy role specifically
    const user = await User.findOne({ email, role: 'pharmacy' });
    if (!user) {
      return errorResponse('No pharmacy account found with this email');
    }

    const otp = generateOTP();
    await storeOTP(email, otp, 10);

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      console.log(`\n🔐 Reset OTP for ${email}: ${otp}\n`);
    }

    return successResponse(
      { ...(emailSent ? {} : { otp }) },
      'OTP sent to your email'
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return errorResponse('Failed to send OTP', 500);
  }
}
