import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Prescription from '@/models/Prescription';
import Pharmacy from '@/models/Pharmacy';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { sendNotificationToUser } from '@/services/notification';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'pharmacy') {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { prescriptionId, items, deliveryFee = 10 } = body;

    if (!prescriptionId || !items || items.length === 0) {
      return errorResponse('Prescription ID and items are required');
    }

    // Get pharmacy
    const pharmacy = await Pharmacy.findOne({ userId: auth.userId });
    if (!pharmacy) {
      return errorResponse('Pharmacy profile not found', 404);
    }

    // Get prescription
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return errorResponse('Prescription not found', 404);
    }

    if (prescription.status !== 'pending') {
      return errorResponse('Prescription is no longer available');
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const totalAmount = subtotal + deliveryFee;

    // Create quote
    const quote = await Quote.create({
      prescriptionId: prescription._id,
      pharmacyId: pharmacy._id,
      patientId: prescription.patientId,
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      status: 'pending',
    });

    // Update prescription status
    prescription.status = 'quoted';
    await prescription.save();

    // Send notification to patient
    await sendNotificationToUser(
      prescription.patientId.toString(),
      'Quote Received',
      `You received a quote for ${totalAmount} MAD from ${pharmacy.pharmacyName}`,
      {
        quoteId: quote._id.toString(),
        type: 'quote_received',
      }
    );

    return successResponse(
      {
        quote: {
          id: quote._id,
          items: quote.items,
          subtotal: quote.subtotal,
          deliveryFee: quote.deliveryFee,
          totalAmount: quote.totalAmount,
          expiresAt: quote.expiresAt,
        },
      },
      'Quote sent successfully',
      201
    );
  } catch (error: any) {
    console.error('Send quote error:', error);
    return errorResponse('Failed to send quote', 500);
  }
}
