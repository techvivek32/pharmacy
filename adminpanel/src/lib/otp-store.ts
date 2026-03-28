// Shared OTP store (use Redis in production)
// Use global to persist across Next.js hot reloads in development
const globalForOTP = global as unknown as {
  otpStore: Map<string, { otp: string; expiresAt: number }> | undefined;
};

export const otpStore = globalForOTP.otpStore ?? new Map<string, { otp: string; expiresAt: number }>();

if (process.env.NODE_ENV !== 'production') {
  globalForOTP.otpStore = otpStore;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(email: string, otp: string, expiryMinutes: number = 10): void {
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;
  otpStore.set(email, { otp, expiresAt });
  console.log(`[OTP] Stored for ${email}: ${otp} (expires in ${expiryMinutes} min)`);
}

export function verifyOTP(email: string, otp: string): { valid: boolean; message: string } {
  console.log(`[OTP] Verifying for ${email}, OTP: ${otp}`);
  console.log(`[OTP] Store size: ${otpStore.size}`);
  console.log(`[OTP] Store contents:`, Array.from(otpStore.entries()));
  
  const stored = otpStore.get(email);

  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired' };
  }

  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  // OTP is valid, remove it
  otpStore.delete(email);
  console.log(`[OTP] ✅ Verified and removed for ${email}`);
  return { valid: true, message: 'OTP verified successfully' };
}
