import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const hasMongoUri = !!process.env.MONGODB_URI;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const hasGmailUser = !!process.env.GMAIL_USER;
    const hasGmailPassword = !!process.env.GMAIL_APP_PASSWORD;

    return NextResponse.json({
      success: true,
      message: 'Health check',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri,
        hasJwtSecret,
        hasGmailUser,
        hasGmailPassword,
        mongoUriPrefix: hasMongoUri ? process.env.MONGODB_URI?.substring(0, 20) + '...' : 'NOT SET',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    }, { status: 500 });
  }
}
