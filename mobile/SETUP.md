# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd mobile
npm install
```

## Step 2: Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
```

## Step 3: Start Development Server

```bash
npm start
```

This will open Expo DevTools in your browser.

## Step 4: Run on Device/Simulator

### Option A: Physical Device (Easiest)
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal or browser
3. App will load on your device

### Option B: iOS Simulator (Mac only)
```bash
npm run ios
```

### Option C: Android Emulator
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Run:
```bash
npm run android
```

## Testing the App

### Test Credentials
You can create a new account or use existing credentials from your web app.

### Test Flow
1. **Sign Up/Login** - Create account or login
2. **Browse Parking** - View available parking spaces
3. **View Details** - Tap on any parking card
4. **Book Parking** - Enter vehicle details and duration
5. **View Bookings** - Check your booking history

## Common Issues

### "Unable to resolve module"
```bash
npm install
expo start -c
```

### Location not working
- Grant location permissions when prompted
- Check device location services are enabled

### Firebase errors
- Verify `.env` file exists with correct credentials
- Check Firebase console for enabled services

## Next Steps

1. Test all features
2. Customize colors/branding
3. Add app icon and splash screen
4. Build for production when ready

## Production Build

### For iOS (requires Mac and Apple Developer account)
```bash
expo build:ios
```

### For Android
```bash
expo build:android
```

## Need Help?

- Expo Docs: https://docs.expo.dev
- React Native Docs: https://reactnative.dev
- Firebase Docs: https://firebase.google.com/docs
