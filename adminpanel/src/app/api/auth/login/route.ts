import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, role, fcmToken } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // Find user by email + role (same email can exist for different roles)
    const user = await User.findOne({ email, role: role || { $exists: true } }).select('+password');
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check if user is active — allow pharmacy to login even if inactive (pending approval)
    if (!user.isActive && user.role !== 'pharmacy') {
      return errorResponse('Account is deactivated', 403);
    }

    // Update FCM token if provided
    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    // Generate token
    const token = generateToken({ userId: user._id.toString(), role: user.role });

    return successResponse({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
}
