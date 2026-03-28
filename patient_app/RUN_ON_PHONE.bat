@echo off
echo ========================================
echo   MediExpress - Run on Phone via USB
echo ========================================
echo.

echo [Step 1/4] Checking phone connection...
echo.
flutter devices
echo.

if %errorlevel% neq 0 (
    echo ERROR: Flutter not found or no devices connected
    echo.
    echo Make sure:
    echo 1. Phone is connected via USB
    echo 2. USB Debugging is enabled
    echo 3. Flutter is installed
    echo.
    pause
    exit /b 1
)

echo [Step 2/4] Cleaning previous build...
flutter clean
echo.

echo [Step 3/4] Getting dependencies...
flutter pub get
echo.

echo [Step 4/4] Running app with live logs...
echo.
echo ========================================
echo   App will install and launch on phone
echo ========================================
echo.
echo COMMANDS:
echo   r  = Hot reload (instant update)
echo   R  = Hot restart (full restart)
echo   q  = Quit
echo   h  = Help
echo.
echo Watch this terminal for live logs!
echo ========================================
echo.

flutter run --verbose

pause
