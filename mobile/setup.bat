@echo off
echo.
echo 🅿️  ParkPass Mobile Setup Script
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node -v

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

echo ✅ npm is installed
npm -v
echo.

REM Install Expo CLI
echo 📦 Installing Expo CLI globally...
call npm install -g expo-cli

echo.
echo 📦 Installing project dependencies...
call npm install

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the app, run:
echo    npm start
echo.
echo 📱 Then:
echo    - Scan QR code with Expo Go app (iOS/Android)
echo    - Press 'a' for Android emulator
echo.
echo 📖 For more info, see README.md
echo.
pause
