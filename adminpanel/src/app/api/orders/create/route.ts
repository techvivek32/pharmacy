import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Prescription from '@/models/Prescription';
import Patient from '@/models/Patient';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'patient') {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { prescriptionId, deliveryAddress } = body;

    if (!prescriptionId || !deliveryAddress) {
      return errorResponse('prescriptionId and deliveryAddress are required');
    }

    // Get patient
    const patient = await Patient.findOne({ userId: auth.userId });
    if (!patient) {
      return errorResponse('Patient profile not found', 404);
    }

    // Verify prescription belongs to this patient
    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      patientId: patient._id,
    });
    if (!prescription) {
      return errorResponse('Prescription not found', 404);
    }

    // Update prescription with delivery address
    const addressText = deliveryAddress.address || deliveryAddress.label || 'Delivery address';
    const coordinates = deliveryAddress.coordinates ||
      deliveryAddress.location?.coordinates || [0, 0];

    await Prescription.findByIdAndUpdate(prescriptionId, {
      deliveryAddress: {
        address: addressText,
        location: { type: 'Point', coordinates },
      },
    });

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create pending order
    const order = await Order.create({
      orderNumber,
      prescriptionId: prescription._id,
      patientId: patient._id,
      status: 'pending',
      deliveryAddress: {
        address: addressText,
        location: { type: 'Point', coordinates },
      },
    });

    return successResponse(
      { order: { ...order.toObject(), _id: order._id } },
      'Order created successfully',
      201
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return errorResponse('Failed to create order', 500);
  }
}
