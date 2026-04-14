import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyOTP } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return errorResponse('Email and OTP are required');
    }

    const result = await verifyOTP(email, otp, false);

    if (!result.valid) {
      return errorResponse(result.message);
    }

    return successResponse(
      { verified: true },
      result.message
    );
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return errorResponse('Failed to verify OTP', 500);
  }
}
