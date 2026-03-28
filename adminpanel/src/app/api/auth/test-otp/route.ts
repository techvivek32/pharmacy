import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/response';
import { generateOTP, storeOTP, verifyOTP, otpStore } from '@/lib/otp-store';

export async function GET(request: NextRequest) {
  const testEmail = 'test@test.com';
  
  // Generate and store OTP
  const otp = generateOTP();
  storeOTP(testEmail, otp, 10);
  
  // Verify it immediately
  const result = verifyOTP(testEmail, otp);
  
  return successResponse({
    test: 'OTP Store Test',
    generatedOTP: otp,
    verificationResult: result,
    storeSize: otpStore.size,
    message: result.valid ? '✅ OTP Store Working!' : '❌ OTP Store Failed!'
  });
}
