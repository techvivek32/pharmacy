@echo off
echo ========================================
echo   MediExpress Patient App
echo   USB Install with Live Logs
echo ========================================
echo.

echo Detected Device: motorola edge 70
echo API URL: http://192.168.1.33:3000/api
echo.

echo ========================================
echo   What will happen:
echo ========================================
echo 1. Clean previous build
echo 2. Get dependencies
echo 3. Build debug APK
echo 4. Install on your phone
echo 5. Launch app
echo 6. Show live logs
echo.
echo You can:
echo   - Press 'r' for hot reload
echo   - Press 'R' for hot restart
echo   - Press 'q' to quit
echo   - See all API calls in real-time
echo ========================================
echo.

pause

echo.
echo [1/5] Cleaning build...
flutter clean

echo.
echo [2/5] Getting dependencies...
flutter pub get

echo.
echo [3/5] Building app...
echo This may take 2-3 minutes...
echo.

echo.
echo [4/5] Installing and launching on phone...
echo.
echo ========================================
echo   LIVE LOGS STARTING
echo ========================================
echo.
echo Watch for:
echo   - App startup logs
echo   - API requests
echo   - Errors (if any)
echo.
echo When you test signup, you'll see:
echo   I/flutter: Making request to API
echo   I/flutter: Response: 200
echo   I/flutter: User created!
echo.
echo ========================================
echo.

flutter run --verbose -d ZD2232F2B4

echo.
echo ========================================
echo   Session Ended
echo ========================================
echo.

pause
