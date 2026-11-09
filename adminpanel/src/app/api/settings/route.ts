import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

const defaults = {
  deliveryFee: 25,
  minDeliveryFee: 100,
  serviceFeeTiers: [
    { maxAmount: 500, fee: 50 },
    { maxAmount: 1000, fee: 70 },
    { maxAmount: 2000, fee: 100 },
  ],
  serviceFeeAbove: 150,
  commissionRate: 15,
  minCommission: 500,
  minOrderAmount: 50,
  maxDeliveryRadius: 10,
  minWithdrawalAmount: 100,
  supportEmail: 'support@ordogo.com',
  supportPhone: '+212 600 000 000',
  razorpayKeyId: '',
  razorpayKeySecret: '',
};

async function getSettings() {
  await connectDB();
  let settings = await Settings.findOne().lean() as any;
  if (!settings) {
    settings = await Settings.create(defaults);
  }
  return settings;
}

export async function GET() {
  try {
    const settings = await getSettings();
    return successResponse({
      deliveryFee: settings.deliveryFee,
      minDeliveryFee: settings.minDeliveryFee ?? 100,
      serviceFeeTiers: settings.serviceFeeTiers ?? defaults.serviceFeeTiers,
      serviceFeeAbove: settings.serviceFeeAbove ?? 150,
      minOrderAmount: settings.minOrderAmount,
      maxDeliveryRadius: settings.maxDeliveryRadius,
      minWithdrawalAmount: settings.minWithdrawalAmount ?? 100,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      razorpayKeyId: settings.razorpayKeyId || '',
      // secret masked for display, full value only used server-side
      razorpayKeySecret: settings.razorpayKeySecret ? '••••••••••••••••••••' : '',
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Don't overwrite secret if masked placeholder was sent back
    if (body.razorpayKeySecret?.includes('•')) {
      delete body.razorpayKeySecret;
    }

    // Legacy fields: percentage commission is replaced by tiered fees.
    delete body.commissionRate;
    delete body.minCommission;

    // Validate tier table if provided: positive thresholds/fees, sorted,
    // no duplicate thresholds.
    if (body.serviceFeeTiers !== undefined) {
      if (!Array.isArray(body.serviceFeeTiers) || body.serviceFeeTiers.length === 0) {
        return errorResponse('serviceFeeTiers must be a non-empty list');
      }
      const tiers = body.serviceFeeTiers.map((t: any) => ({
        maxAmount: Number(t.maxAmount),
        fee: Number(t.fee),
      }));
      for (const t of tiers) {
        if (!isFinite(t.maxAmount) || t.maxAmount <= 0 || !isFinite(t.fee) || t.fee < 0) {
          return errorResponse('Each tier needs a positive amount and a non-negative fee');
        }
      }
      tiers.sort((a: any, b: any) => a.maxAmount - b.maxAmount);
      for (let i = 1; i < tiers.length; i++) {
        if (tiers[i].maxAmount === tiers[i - 1].maxAmount) {
          return errorResponse('Tier amounts must be unique');
        }
      }
      body.serviceFeeTiers = tiers;
    }
    if (body.deliveryFee !== undefined && (!isFinite(Number(body.deliveryFee)) || Number(body.deliveryFee) <= 0)) {
      return errorResponse('Delivery fee per km must be a positive number');
    }
    if (body.minDeliveryFee !== undefined && (!isFinite(Number(body.minDeliveryFee)) || Number(body.minDeliveryFee) < 0)) {
      return errorResponse('Minimum delivery fee must be zero or more');
    }
    if (body.serviceFeeAbove !== undefined && (!isFinite(Number(body.serviceFeeAbove)) || Number(body.serviceFeeAbove) < 0)) {
      return errorResponse('Top-tier fee must be zero or more');
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    ).lean() as any;

    return successResponse({
      deliveryFee: settings.deliveryFee,
      minDeliveryFee: settings.minDeliveryFee ?? 100,
      serviceFeeTiers: settings.serviceFeeTiers ?? defaults.serviceFeeTiers,
      serviceFeeAbove: settings.serviceFeeAbove ?? 150,
      minOrderAmount: settings.minOrderAmount,
      maxDeliveryRadius: settings.maxDeliveryRadius,
      minWithdrawalAmount: settings.minWithdrawalAmount ?? 100,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      razorpayKeyId: settings.razorpayKeyId || '',
      razorpayKeySecret: settings.razorpayKeySecret ? '••••••••••••••••••••' : '',
    }, 'Settings updated successfully');
  } catch (error: any) {
    console.error('Update settings error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
