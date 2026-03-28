import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }

    let patient = await Patient.findOne({ userId: decoded.userId });
    
    if (!patient) {
      // Create patient record if doesn't exist
      patient = await Patient.create({
        userId: decoded.userId,
        addresses: [],
        totalOrders: 0,
      });
    }

    return successResponse({ addresses: patient.addresses });
  } catch (error: any) {
    console.error('Get addresses error:', error);
    return errorResponse('Failed to get addresses', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }

    const { label, address, city, latitude, longitude, isDefault } = await request.json();

    if (!label || !address || !latitude || !longitude) {
      return errorResponse('Missing required fields');
    }

    let patient = await Patient.findOne({ userId: decoded.userId });
    
    if (!patient) {
      patient = await Patient.create({
        userId: decoded.userId,
        addresses: [],
        totalOrders: 0,
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      patient.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // Add new address
    patient.addresses.push({
      label,
      address: city ? `${address}, ${city}` : address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      isDefault: isDefault || patient.addresses.length === 0,
    } as any);

    await patient.save();

    return successResponse(
      { addresses: patient.addresses },
      'Address added successfully'
    );
  } catch (error: any) {
    console.error('Add address error:', error);
    return errorResponse('Failed to add address', 500);
  }
}
