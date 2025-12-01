# ParkPass Mobile App - Quick Start

## 📱 What's New

A complete React Native mobile app has been created in the `mobile/` directory. It works with your existing Firebase backend and provides a native mobile experience for iOS and Android.

## 🚀 Quick Start (3 Steps)

### 1. Navigate to mobile directory
```bash
cd mobile
```

### 2. Run setup script

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Or manually:**
```bash
npm install -g expo-cli
npm install
```

### 3. Start the app
```bash
npm start
```

Then scan the QR code with Expo Go app on your phone!

## 📲 Install Expo Go

- **iOS**: https://apps.apple.com/app/expo-go/id982107779
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

## ✨ Features

- ✅ User authentication (Email/Password)
- ✅ Browse parking spaces
- ✅ Real-time availability
- ✅ Location-based search
- ✅ Book parking spots
- ✅ View booking history
- ✅ User profile

## 📁 Project Structure

```
mobile/
├── src/
│   ├── screens/        # App screens (Home, Booking, Profile, etc.)
│   ├── components/     # Reusable UI components
│   ├── services/       # Firebase services (same as web)
│   ├── contexts/       # State management
│   ├── navigation/     # App navigation
│   └── config/         # Firebase config
├── App.js             # Root component
├── package.json       # Dependencies
└── README.md          # Detailed documentation
```

## 🔧 Configuration

The mobile app uses the same Firebase configuration as your web app. No additional setup needed!

## 📖 Documentation

- **Detailed Guide**: See `MOBILE_APP_GUIDE.md`
- **Mobile README**: See `mobile/README.md`
- **Setup Guide**: See `mobile/SETUP.md`

## 🎯 Key Differences from Web

| Feature | Web | Mobile |
|---------|-----|--------|
| UI Framework | React + Tailwind | React Native |
| Navigation | React Router | React Navigation |
| Styling | CSS/Tailwind | StyleSheet API |
| Maps | Mapbox/Leaflet | React Native Maps |
| Platform | Browser | iOS & Android |

## 🔄 Shared Backend

Both web and mobile apps use:
- Same Firebase project
- Same Firestore collections
- Same authentication
- Same business logic

**Result**: Data syncs automatically between web and mobile!

## 🧪 Testing

1. **Sign up** with a new account
2. **Browse** parking spaces
3. **View details** of a parking spot
4. **Book** a parking space
5. **Check** your bookings
6. **View** your profile

## 🚢 Deployment

### Development
- Use Expo Go app (no build needed)
- Instant updates via QR code

### Production
```bash
# iOS (requires Mac + Apple Developer account)
expo build:ios

# Android (requires Google Play Developer account)
expo build:android
```

## 💡 Next Steps

1. **Test the app** on your device
2. **Customize** colors and branding
3. **Add features** (maps, payments, etc.)
4. **Deploy** to app stores

## 🆘 Need Help?

- Check `mobile/README.md` for detailed docs
- See `MOBILE_APP_GUIDE.md` for complete guide
- Review `mobile/SETUP.md` for troubleshooting

## 📊 What's Included vs Web

### Mobile App Has:
✅ Core parking features
✅ Booking system
✅ User authentication
✅ Real-time updates
✅ Native mobile UI

### Use Web App For:
🌐 Admin dashboard
🌐 Analytics
🌐 User management
🌐 Advanced features

## 🎉 You're Ready!

Your mobile app is ready to use. Just run:

```bash
cd mobile
npm start
```

Then scan the QR code with Expo Go!

---

**Questions?** Check the documentation files or the main README.
