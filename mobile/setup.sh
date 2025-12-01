#!/bin/bash

echo "🅿️  ParkPass Mobile Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install Expo CLI if not installed
if ! command -v expo &> /dev/null
then
    echo "📦 Installing Expo CLI globally..."
    npm install -g expo-cli
else
    echo "✅ Expo CLI is already installed"
fi

echo ""
echo "📦 Installing project dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the app, run:"
echo "   npm start"
echo ""
echo "📱 Then:"
echo "   - Scan QR code with Expo Go app (iOS/Android)"
echo "   - Press 'i' for iOS simulator (Mac only)"
echo "   - Press 'a' for Android emulator"
echo ""
echo "📖 For more info, see README.md"
