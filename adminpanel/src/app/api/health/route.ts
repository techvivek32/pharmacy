import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const hasMongoUri = !!process.env.MONGODB_URI;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const hasGmailUser = !!process.env.GMAIL_USER;
    const hasGmailPassword = !!process.env.GMAIL_APP_PASSWORD;

    // Push notifications require all three of these; if any is missing the
    // server silently skips FCM and only saves notifications in-app.
    const hasFirebaseProjectId = !!process.env.FIREBASE_PROJECT_ID;
    const hasFirebaseClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    const hasFirebasePrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
    const pushReady = hasFirebaseProjectId && hasFirebaseClientEmail && hasFirebasePrivateKey;

    return NextResponse.json({
      success: true,
      message: 'Health check',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri,
        hasJwtSecret,
        hasGmailUser,
        hasGmailPassword,
        hasFirebaseProjectId,
        hasFirebaseClientEmail,
        hasFirebasePrivateKey,
        pushReady,
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
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
