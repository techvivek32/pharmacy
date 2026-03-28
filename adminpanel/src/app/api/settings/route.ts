import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';

// This is a placeholder for app settings
// In production, you would store these in a database
const defaultSettings = {
  app: {
    name: 'MediExpress',
    version: '1.0.0',
    maintenanceMode: false,
  },
  delivery: {
    defaultFee: 10,
    maxDistance: 50, // km
    estimatedTime: 30, // minutes
  },
  prescription: {
    expiryTime: 24, // hours
    maxFileSize: 10, // MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
  quote: {
    expiryTime: 30, // minutes
    maxItems: 50,
  },
  notifications: {
    enabled: true,
    emailNotifications: true,
    pushNotifications: true,
  },
  payment: {
    methods: ['cash', 'card', 'mobile'],
    currency: 'MAD',
  },
};

export async function GET(request: NextRequest) {
  try {
    return successResponse(defaultSettings);
  } catch (error: any) {
    console.error('Get settings error:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production, you would update these in a database
    // For now, just return success
    
    return successResponse({
      message: 'Settings updated successfully',
      settings: { ...defaultSettings, ...body },
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
