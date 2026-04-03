import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

const defaults = {
  deliveryFee: 20,
  commissionRate: 15,
  minOrderAmount: 50,
  maxDeliveryRadius: 10,
  supportEmail: 'support@ordogo.com',
  supportPhone: '+212 600 000 000',
  maintenanceMode: false,
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
      commissionRate: settings.commissionRate,
      minOrderAmount: settings.minOrderAmount,
      maxDeliveryRadius: settings.maxDeliveryRadius,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      maintenanceMode: settings.maintenanceMode,
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

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    ).lean() as any;

    return successResponse({
      deliveryFee: settings.deliveryFee,
      commissionRate: settings.commissionRate,
      minOrderAmount: settings.minOrderAmount,
      maxDeliveryRadius: settings.maxDeliveryRadius,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      maintenanceMode: settings.maintenanceMode,
    }, 'Settings updated successfully');
  } catch (error: any) {
    console.error('Update settings error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
