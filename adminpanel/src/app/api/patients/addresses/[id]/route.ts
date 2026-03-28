import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { label, address, city, state, zipCode, latitude, longitude, isDefault } = await request.json();

    const patient = await Patient.findOne({ userId: decoded.userId });
    if (!patient) {
      return errorResponse('Patient not found', 404);
    }

    const addressIndex = patient.addresses.findIndex(
      (addr: any) => addr._id.toString() === params.id
    );

    if (addressIndex === -1) {
      return errorResponse('Address not found', 404);
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      patient.addresses.forEach((addr: any, index: number) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    if (label) patient.addresses[addressIndex].label = label;
    if (address) patient.addresses[addressIndex].address = address;
    if (city !== undefined) patient.addresses[addressIndex].city = city;
    if (state !== undefined) patient.addresses[addressIndex].state = state;
    if (zipCode !== undefined) patient.addresses[addressIndex].zipCode = zipCode;
    if (latitude && longitude) {
      patient.addresses[addressIndex].location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }
    if (isDefault !== undefined) {
      patient.addresses[addressIndex].isDefault = isDefault;
    }

    await patient.save();

    return successResponse(
      { addresses: patient.addresses },
      'Address updated successfully'
    );
  } catch (error: any) {
    console.error('Update address error:', error);
    return errorResponse('Failed to update address', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const patient = await Patient.findOne({ userId: decoded.userId });
    if (!patient) {
      return errorResponse('Patient not found', 404);
    }

    const addressIndex = patient.addresses.findIndex(
      (addr: any) => addr._id.toString() === params.id
    );

    if (addressIndex === -1) {
      return errorResponse('Address not found', 404);
    }

    patient.addresses.splice(addressIndex, 1);
    await patient.save();

    return successResponse(
      { addresses: patient.addresses },
      'Address deleted successfully'
    );
  } catch (error: any) {
    console.error('Delete address error:', error);
    return errorResponse('Failed to delete address', 500);
  }
}
