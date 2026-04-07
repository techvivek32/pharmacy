import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/response';
import { generateOTP, storeOTP, verifyOTP } from '@/lib/otp-store';

export async function GET(request: NextRequest) {
  const testEmail = 'test@test.com';

  const otp = generateOTP();
  await storeOTP(testEmail, otp, 10);

  const result = await verifyOTP(testEmail, otp);

  return successResponse({
    test: 'OTP Store Test',
    generatedOTP: otp,
    verificationResult: result,
    message: result.valid ? '✅ OTP Store Working!' : '❌ OTP Store Failed!',
  });
}
