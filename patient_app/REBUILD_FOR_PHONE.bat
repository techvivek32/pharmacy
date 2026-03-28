@echo off
echo ========================================
echo   Rebuilding App for Physical Device
echo ========================================
echo.
echo API URL: http://192.168.1.33:3000/api
echo.

echo [1/4] Cleaning previous build...
flutter clean
echo.

echo [2/4] Getting dependencies...
flutter pub get
echo.

echo [3/4] Building release APK...
echo This will take 5-10 minutes...
flutter build apk --release
echo.

echo [4/4] Build complete!
echo.
echo ========================================
echo   APK Location:
echo ========================================
echo build\app\outputs\flutter-apk\app-release.apk
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo 1. Copy APK to your phone
echo 2. Uninstall old app
echo 3. Install new APK
echo 4. Test signup!
echo.

pause
