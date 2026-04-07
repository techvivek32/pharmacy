import connectDB from './mongodb';
import OtpModel from '@/models/Otp';

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(email: string, otp: string, expiryMinutes: number = 10): Promise<void> {
  await connectDB();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  await OtpModel.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true, new: true }
  );
  console.log(`[OTP] Stored for ${email}: ${otp} (expires in ${expiryMinutes} min)`);
}

export async function verifyOTP(email: string, otp: string): Promise<{ valid: boolean; message: string }> {
  await connectDB();
  const stored = await OtpModel.findOne({ email });

  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (Date.now() > stored.expiresAt.getTime()) {
    await OtpModel.deleteOne({ email });
    return { valid: false, message: 'OTP has expired' };
  }

  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  await OtpModel.deleteOne({ email });
  console.log(`[OTP] ✅ Verified and removed for ${email}`);
  return { valid: true, message: 'OTP verified successfully' };
}
