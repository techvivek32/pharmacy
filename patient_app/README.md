# Patient Mobile App

Flutter mobile application for patients to order prescription medicines.

## Features

- User authentication (login/signup)
- Upload prescription images
- View nearby pharmacies
- Receive and compare price quotes
- Place orders with payment options
- Track delivery in real-time
- Order history
- Push notifications
- Profile management

## Screens

1. **Splash Screen** - App initialization
2. **Login/Signup** - User authentication
3. **Home Dashboard** - Main screen with quick actions
4. **Upload Prescription** - Camera/gallery integration
5. **Address Selection** - Choose delivery location
6. **Quotes Screen** - View pharmacy quotes
7. **Order Confirmation** - Review and confirm order
8. **Payment Screen** - Select payment method
9. **Live Tracking** - Real-time delivery tracking
10. **Order History** - Past orders
11. **Notifications** - Push notifications
12. **Profile** - User settings

## Setup

```bash
flutter pub get
flutter run
```

## Configuration

Update API URL in `lib/services/api_service.dart`:
```dart
static const String baseUrl = 'YOUR_API_URL';
```

Add Firebase configuration files:
- Android: `android/app/google-services.json`
- iOS: `ios/Runner/GoogleService-Info.plist`

Add Google Maps API key:
- Android: `android/app/src/main/AndroidManifest.xml`
- iOS: `ios/Runner/AppDelegate.swift`
