@echo off
echo ========================================
echo   MediExpress Patient App Launcher
echo ========================================
echo.

echo [1/3] Checking Flutter installation...
flutter --version
if %errorlevel% neq 0 (
    echo ERROR: Flutter is not installed or not in PATH
    pause
    exit /b 1
)
echo.

echo [2/3] Checking connected devices...
flutter devices
echo.

echo [3/3] Starting Patient App...
echo.
echo Choose your platform:
echo 1. Android Emulator
echo 2. iOS Simulator (macOS only)
echo 3. Chrome (Web)
echo 4. Auto-detect
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    echo Starting on Android...
    flutter run
) else if "%choice%"=="2" (
    echo Starting on iOS...
    flutter run
) else if "%choice%"=="3" (
    echo Starting on Chrome...
    flutter run -d chrome
) else (
    echo Auto-detecting device...
    flutter run
)

pause
