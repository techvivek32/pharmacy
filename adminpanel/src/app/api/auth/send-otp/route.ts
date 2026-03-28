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

    if (!email) {
      return errorResponse('Email is required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User already exists with this email');
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp, 10);

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      console.log(`\n🔐 OTP for ${email}: ${otp} (Email failed, showing in console)\n`);
    }

    return successResponse(
      { 
        message: 'OTP sent successfully',
        // Only include OTP in response if email failed (for development)
        ...(emailSent ? {} : { otp })
      },
      'OTP sent to your email'
    );
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return errorResponse('Failed to send OTP', 500);
  }
}
