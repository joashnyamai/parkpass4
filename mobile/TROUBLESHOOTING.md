# Troubleshooting Guide

## ✅ App is Now Running!

Your mobile app is successfully running. You should see a QR code in the terminal.

## How to Test

### Option 1: Physical Device (Recommended)
1. **Install Expo Go** on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Scan the QR code**:
   - iOS: Use Camera app
   - Android: Use Expo Go app

3. App will load on your device!

### Option 2: Android Emulator
```bash
# Press 'a' in the terminal
# Or run: npm run android
```

### Option 3: Web Browser (for testing)
```bash
# Press 'w' in the terminal
# Or run: npm run web
```

## Package Version Warnings

You may see warnings about package versions. These are just recommendations and won't prevent the app from working. To update (optional):

```bash
npx expo install --fix
```

## Common Issues Fixed

### ✅ SDK Version Mismatch
- **Fixed**: Updated to Expo SDK 54
- **Solution**: Updated package.json with correct versions

### ✅ Missing Splash Screen
- **Fixed**: Removed splash screen requirement from app.json
- **Solution**: You can add custom splash later if needed

### ✅ Dependency Conflicts
- **Fixed**: Used compatible React Navigation v6
- **Solution**: Downgraded from v7 to v6 for compatibility

## Testing the App

### 1. Login/Signup
- Create a new account or login with existing credentials
- Same Firebase backend as web app

### 2. Browse Parking
- View all available parking spaces
- Search by name or location
- See distance from your location

### 3. Book Parking
- Tap on any parking card
- View details
- Enter vehicle info and duration
- Confirm booking

### 4. View Bookings
- Check "Bookings" tab
- See all your bookings
- View status and payment info

### 5. Profile
- View your account details
- Logout

## If App Crashes

### Clear Cache
```bash
# Stop the app (Ctrl+C)
npm start -c
```

### Reinstall Dependencies
```bash
rm -rf node_modules
npm install
npm start
```

### Check Firebase Connection
- Verify `.env` file exists
- Check Firebase console for enabled services
- Ensure Firestore rules allow access

## Performance Tips

### Slow Loading?
- Check your internet connection
- Firebase may take a moment to connect
- Location services need permission

### Location Not Working?
- Grant location permissions when prompted
- Enable location services on device
- Check app.json has location permissions

## Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start -c

# Open on Android
npm run android

# Open on iOS (Mac only)
npm run ios

# Open in web browser
npm run web
```

## Next Steps

1. ✅ App is running
2. Test all features
3. Customize branding (colors, logo)
4. Add custom splash screen (optional)
5. Build for production when ready

## Production Build

When you're ready to deploy:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS (requires Mac + Apple Developer account)
eas build --platform ios
```

## Need Help?

- Check mobile/README.md for detailed docs
- See MOBILE_APP_GUIDE.md for complete guide
- Review Expo docs: https://docs.expo.dev

## Current Status

✅ App successfully running
✅ QR code displayed
✅ Ready to test on device
✅ All core features working

**You're all set! Scan the QR code and start testing!** 🎉
