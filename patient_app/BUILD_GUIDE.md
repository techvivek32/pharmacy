# 📱 MediExpress Patient App - Build Guide

## 🎯 Overview

The Patient App is a Flutter mobile application that allows patients to:
- Upload prescriptions
- Receive quotes from pharmacies
- Place orders
- Track deliveries in real-time
- Manage their profile

---

## ✅ Prerequisites

### Required Software
- Flutter SDK 3.0.0 or higher
- Dart SDK (comes with Flutter)
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- VS Code or Android Studio IDE

### Check Flutter Installation
```bash
flutter doctor
```

---

## 📦 Installation Steps

### 1. Navigate to Patient App Directory
```bash
cd apps/patient_app
```

### 2. Install Dependencies
```bash
flutter pub get
```

### 3. Verify Installation
```bash
flutter doctor -v
```

---

## 🏗️ Project Structure

```
apps/patient_app/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   │   └── app_constants.dart      # API URLs, app config
│   │   ├── theme/
│   │   │   └── app_theme.dart          # Material 3 theme
│   │   └── widgets/
│   │       ├── app_card.dart
│   │       ├── input_field.dart
│   │       ├── loading_skeleton.dart
│   │       ├── order_status_widget.dart
│   │       └── primary_button.dart
│   ├── features/
│   │   ├── auth/
│   │   │   └── screens/
│   │   │       ├── splash_screen.dart
│   │   │       ├── login_screen.dart
│   │   │       └── signup_screen.dart
│   │   ├── home/
│   │   │   └── screens/
│   │   │       └── home_screen.dart
│   │   ├── prescription/
│   │   │   └── screens/
│   │   │       ├── upload_prescription_screen.dart
│   │   │       └── address_selection_screen.dart
│   │   ├── orders/
│   │   │   └── screens/
│   │   │       ├── quote_details_screen.dart
│   │   │       ├── payment_selection_screen.dart
│   │   │       ├── order_tracking_screen.dart
│   │   │       └── order_history_screen.dart
│   │   └── profile/
│   │       └── screens/
│   │           └── profile_screen.dart
│   ├── models/
│   │   ├── user_model.dart
│   │   ├── prescription_model.dart
│   │   ├── quote_model.dart
│   │   └── order_model.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── prescription_provider.dart
│   │   └── order_provider.dart
│   ├── services/
│   │   ├── api_service.dart
│   │   ├── auth_service.dart
│   │   ├── prescription_service.dart
│   │   └── order_service.dart
│   └── main.dart
├── assets/
│   ├── images/
│   └── icons/
├── pubspec.yaml
└── README.md
```

---

## 🚀 Running the App

### Run on Android Emulator
```bash
# Start Android emulator first, then:
flutter run
```

### Run on iOS Simulator (macOS only)
```bash
# Start iOS simulator first, then:
flutter run
```

### Run on Physical Device
```bash
# Connect device via USB with debugging enabled
flutter devices  # List connected devices
flutter run -d <device-id>
```

### Run on Chrome (Web)
```bash
flutter run -d chrome
```

---

## 🔧 Configuration

### API Configuration

Edit `lib/core/constants/app_constants.dart`:

```dart
class AppConstants {
  // For Android Emulator
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  
  // For iOS Simulator
  // static const String baseUrl = 'http://localhost:3000/api';
  
  // For Physical Device (use your computer's IP)
  // static const String baseUrl = 'http://192.168.1.100:3000/api';
}
```

### Backend Server

Make sure the backend is running on port 3000:
```bash
cd backend
npm run dev
```

---

## 📱 Build for Production

### Android APK
```bash
flutter build apk --release
```
Output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)
```bash
flutter build appbundle --release
```
Output: `build/app/outputs/bundle/release/app-release.aab`

### iOS (macOS only)
```bash
flutter build ios --release
```

---

## 🎨 Features

### 1. Authentication
- Splash screen with app branding
- Login with phone/email
- Signup with validation
- Token-based authentication

### 2. Prescription Upload
- Camera capture
- Gallery selection
- Multiple image upload
- Address selection with map

### 3. Quote Management
- View quotes from pharmacies
- Compare prices
- Select best quote
- Pharmacy details

### 4. Order Management
- Payment method selection
- Order confirmation
- Real-time tracking
- Order history

### 5. Profile
- View/edit profile
- Order history
- Saved addresses
- Logout

---

## 🧪 Testing

### Run Tests
```bash
flutter test
```

### Run with Coverage
```bash
flutter test --coverage
```

---

## 🐛 Troubleshooting

### Issue: Dependencies not resolving
```bash
flutter clean
flutter pub get
```

### Issue: Android build fails
```bash
cd android
./gradlew clean
cd ..
flutter build apk
```

### Issue: iOS build fails (macOS)
```bash
cd ios
pod install
cd ..
flutter build ios
```

### Issue: Cannot connect to backend
1. Check backend is running on port 3000
2. For Android emulator, use `10.0.2.2:3000`
3. For iOS simulator, use `localhost:3000`
4. For physical device, use your computer's IP address

### Issue: Hot reload not working
```bash
# Press 'r' in terminal for hot reload
# Press 'R' for hot restart
# Or stop and run again
```

---

## 📊 Performance Optimization

### Enable Obfuscation (Production)
```bash
flutter build apk --obfuscate --split-debug-info=build/debug-info
```

### Reduce APK Size
```bash
flutter build apk --split-per-abi
```

This creates separate APKs for:
- `app-armeabi-v7a-release.apk` (32-bit ARM)
- `app-arm64-v8a-release.apk` (64-bit ARM)
- `app-x86_64-release.apk` (64-bit x86)

---

## 🔐 Security Notes

1. Never commit API keys or secrets
2. Use environment variables for sensitive data
3. Enable ProGuard for Android release builds
4. Use HTTPS in production
5. Implement certificate pinning for API calls

---

## 📱 Device Testing Checklist

- [ ] Android 8.0+ (API 26+)
- [ ] iOS 12.0+
- [ ] Different screen sizes (phone, tablet)
- [ ] Portrait and landscape orientations
- [ ] Dark mode support
- [ ] Network connectivity changes
- [ ] Low memory devices
- [ ] Slow network conditions

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
flutter pub get

# Run on connected device
flutter run

# Build release APK
flutter build apk --release

# Check for issues
flutter doctor

# Clean build
flutter clean && flutter pub get
```

---

## 📞 Support

For issues or questions:
- Check the main README.md
- Review API documentation
- Check Flutter documentation: https://flutter.dev/docs

---

## 🎯 Next Steps

1. ✅ Install Flutter and dependencies
2. ✅ Run `flutter pub get`
3. ✅ Start backend server on port 3000
4. ✅ Configure API URL in app_constants.dart
5. ✅ Run app with `flutter run`
6. ✅ Test all features
7. ✅ Build release version

---

**Status**: ✅ Ready to Build and Run
