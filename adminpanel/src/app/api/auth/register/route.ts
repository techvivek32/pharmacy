import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Pharmacy from '@/models/Pharmacy';
import Rider from '@/models/Rider';
import { hashPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { fullName, email, phone, password, role, ...roleData } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !role) {
      return errorResponse('All fields are required');
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return errorResponse('User already exists with this email or phone');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      isVerified: false,
    });

    // Create role-specific profile
    if (role === 'patient') {
      await Patient.create({
        userId: user._id,
        addresses: [],
      });
    } else if (role === 'pharmacy') {
      await Pharmacy.create({
        userId: user._id,
        pharmacyName: roleData.pharmacyName,
        licenseNumber: roleData.licenseNumber,
        address: roleData.address,
        location: {
          type: 'Point',
          coordinates: roleData.coordinates,
        },
        approvalStatus: 'pending',
      });
      // Mark user inactive until admin approves
      await User.findByIdAndUpdate(user._id, { isActive: false });
    } else if (role === 'rider') {
      await Rider.create({
        userId: user._id,
        vehicleType: roleData.vehicleType,
        vehicleNumber: roleData.vehicleNumber,
        licenseNumber: roleData.licenseNumber,
      });
    }

    // Generate token
    const token = generateToken({ userId: user._id.toString(), role: user.role });

    return successResponse(
      {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
      'Registration successful',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse('Registration failed', 500);
  }
}
