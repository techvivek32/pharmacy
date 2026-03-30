import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Prescription from '@/models/Prescription';
import Pharmacy from '@/models/Pharmacy';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { sendNotificationToUser } from '@/services/notification';

export const dynamic = 'force-dynamic';

// GET: fetch existing quote for a prescription by this pharmacy
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'pharmacy') return unauthorizedResponse();

    await connectDB();

    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('prescriptionId');
    if (!prescriptionId) return errorResponse('prescriptionId is required');

    const pharmacy = await Pharmacy.findOne({ userId: auth.userId }).lean() as any;
    if (!pharmacy) return errorResponse('Pharmacy not found', 404);

    const quote = await Quote.findOne({
      prescriptionId,
      pharmacyId: pharmacy._id,
    }).lean() as any;

    if (!quote) return successResponse({ quote: null });

    return successResponse({
      quote: {
        id: quote._id,
        items: quote.items,
        subtotal: quote.subtotal,
        deliveryFee: quote.deliveryFee,
        totalAmount: quote.totalAmount,
        status: quote.status,
      },
    });
  } catch (error) {
    console.error('Get quote error:', error);
    return errorResponse('Failed to fetch quote', 500);
  }
}

// POST: create or update quote
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'pharmacy') return unauthorizedResponse();

    await connectDB();

    const body = await request.json();
    const { prescriptionId, items, deliveryFee = 10 } = body;

    if (!prescriptionId || !items || items.length === 0) {
      return errorResponse('Prescription ID and items are required');
    }

    const pharmacy = await Pharmacy.findOne({ userId: auth.userId });
    if (!pharmacy) return errorResponse('Pharmacy profile not found', 404);

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) return errorResponse('Prescription not found', 404);

    if (!['pending', 'quoted'].includes(prescription.status)) {
      return errorResponse('Prescription is no longer available');
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const totalAmount = subtotal + deliveryFee;

    // Check if quote already exists from this pharmacy
    const existingQuote = await Quote.findOne({
      prescriptionId: prescription._id,
      pharmacyId: pharmacy._id,
    });

    let quote;
    let isEdit = false;

    if (existingQuote) {
      // Update existing quote
      existingQuote.items = items;
      existingQuote.subtotal = subtotal;
      existingQuote.deliveryFee = deliveryFee;
      existingQuote.totalAmount = totalAmount;
      existingQuote.status = 'pending';
      await existingQuote.save();
      quote = existingQuote;
      isEdit = true;
    } else {
      // Create new quote
      quote = await Quote.create({
        prescriptionId: prescription._id,
        pharmacyId: pharmacy._id,
        patientId: prescription.patientId,
        items,
        subtotal,
        deliveryFee,
        totalAmount,
        status: 'pending',
      });

      // Update prescription status to quoted
      prescription.status = 'quoted';
      await prescription.save();
    }

    // Notify patient
    try {
      await sendNotificationToUser(
        prescription.patientId.toString(),
        isEdit ? 'Quote Updated' : 'Quote Received',
        `${isEdit ? 'Updated quote' : 'New quote'} of ${totalAmount} MAD from ${pharmacy.pharmacyName}`,
        { quoteId: quote._id.toString(), type: 'quote_received' }
      );
    } catch (_) {}

    return successResponse(
      {
        quote: {
          id: quote._id,
          items: quote.items,
          subtotal: quote.subtotal,
          deliveryFee: quote.deliveryFee,
          totalAmount: quote.totalAmount,
        },
        isEdit,
      },
      isEdit ? 'Quote updated successfully' : 'Quote sent successfully',
      201
    );
  } catch (error: any) {
    console.error('Send quote error:', error);
    return errorResponse('Failed to send quote', 500);
  }
}
