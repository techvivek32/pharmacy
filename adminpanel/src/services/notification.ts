import admin from 'firebase-admin';
import User from '@/models/User';
import Notification from '@/models/Notification';

// Initialize Firebase Admin (optional - only if credentials are provided)
let firebaseInitialized = false;
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      } as admin.ServiceAccount),
    });
    firebaseInitialized = true;
  } catch (error) {
    console.warn('Firebase Admin initialization skipped:', error);
  }
}

export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    // Save notification to database
    await Notification.create({
      userId,
      title,
      body,
      type: data?.type || 'general',
      data,
    });

    // Only send FCM notification if Firebase is initialized
    if (!firebaseInitialized) {
      console.log('Firebase not initialized, skipping push notification');
      return;
    }

    // Get user FCM token
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      return;
    }

    // Send FCM notification
    await admin.messaging().send({
      token: user.fcmToken,
      notification: { title, body },
      data: data || {},
    });
  } catch (error) {
    console.error('Send notification error:', error);
  }
}

export async function sendNotificationToPharmacies(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    const users = await User.find({ _id: { $in: userIds }, fcmToken: { $exists: true } });

    // Save notifications
    const notifications = userIds.map((userId) => ({
      userId,
      title,
      body,
      type: data?.type || 'general',
      data,
    }));
    await Notification.insertMany(notifications);

    // Send FCM notifications
    const tokens = users.map((u) => u.fcmToken).filter(Boolean) as string[];
    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data || {},
      });
    }
  } catch (error) {
    console.error('Send notifications error:', error);
  }
}
