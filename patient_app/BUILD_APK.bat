@echo off
echo ========================================
echo   MediExpress Patient App - Build APK
echo ========================================
echo.

echo [1/4] Cleaning previous builds...
flutter clean
echo.

echo [2/4] Getting dependencies...
flutter pub get
echo.

echo [3/4] Building release APK...
flutter build apk --release
echo.

echo [4/4] Build complete!
echo.
echo APK Location:
echo build\app\outputs\flutter-apk\app-release.apk
echo.
echo File size:
dir build\app\outputs\flutter-apk\app-release.apk
echo.

pause
