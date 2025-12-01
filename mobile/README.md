# ParkPass Mobile App

React Native mobile application for the ParkPass parking management system.

## Features

- 🔐 User authentication (Email/Password)
- 🅿️ Browse available parking spaces
- 📍 Location-based parking search
- 🗺️ Real-time parking availability
- 📱 Book parking spots
- 💳 Payment integration (Stripe)
- 📋 View booking history
- 👤 User profile management

## Tech Stack

- **React Native** with Expo
- **Firebase** (Authentication, Firestore)
- **React Navigation** for routing
- **Expo Location** for geolocation
- **Stripe** for payments
- **React Native Maps** for map display

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for Android development)
- Expo Go app on your physical device (optional)

## Installation

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Update `.env` file with your Firebase credentials
   - The file is already configured with the web app's credentials

4. **Start the development server:**
   ```bash
   npm start
   ```

## Running the App

### On iOS Simulator (Mac only)
```bash
npm run ios
```

### On Android Emulator
```bash
npm run android
```

### On Physical Device
1. Install **Expo Go** app from App Store or Play Store
2. Scan the QR code shown in terminal
3. App will load on your device

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── ParkingCard.js
│   ├── config/          # Configuration files
│   │   └── firebase.js
│   ├── contexts/        # React Context providers
│   │   ├── AuthContext.js
│   │   └── ParkingContext.js
│   ├── navigation/      # Navigation setup
│   │   └── AppNavigator.js
│   ├── screens/         # App screens
│   │   ├── HomeScreen.js
│   │   ├── ParkingDetailScreen.js
│   │   ├── BookingScreen.js
│   │   ├── BookingsListScreen.js
│   │   ├── LoginScreen.js
│   │   └── ProfileScreen.js
│   └── services/        # API and business logic
│       ├── authService.js
│       ├── parkingService.js
│       └── bookingService.js
├── App.js              # Root component
├── app.json            # Expo configuration
├── package.json        # Dependencies
└── .env               # Environment variables
```

## Key Features Implementation

### Authentication
- Email/Password sign in and sign up
- Persistent authentication state
- User profile management

### Parking Search
- Real-time parking space updates
- Location-based distance calculation
- Search and filter functionality

### Booking System
- Create new bookings
- View booking history
- Real-time booking status updates

### Navigation
- Bottom tab navigation (Home, Bookings, Profile)
- Stack navigation for detail screens
- Deep linking support

## Firebase Setup

The app uses the same Firebase project as the web app:
- **Authentication**: Email/Password provider
- **Firestore Collections**:
  - `Users` - User profiles
  - `ParkingSpaces` - Parking locations
  - `ParkingHistory` - Booking records

## Customization

### Colors
Main colors are defined in component styles:
- Primary: `#2563eb` (Blue)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)

### App Icon & Splash Screen
- Place your icon in `assets/icon.png` (1024x1024)
- Place splash screen in `assets/splash.png` (1242x2436)

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Troubleshooting

### Location Permission Issues
- iOS: Check `Info.plist` for location permissions
- Android: Check `AndroidManifest.xml` for location permissions

### Firebase Connection Issues
- Verify `.env` file has correct credentials
- Check Firebase console for enabled services

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start -c
```

## Differences from Web App

### What's Included
- Core parking search and booking
- User authentication
- Real-time updates
- Location services

### Not Yet Implemented
- Admin dashboard (use web app)
- Analytics (use web app)
- QR code scanning
- Push notifications
- Payment processing (coming soon)

## Next Steps

1. **Add Maps**: Integrate React Native Maps for visual parking location
2. **Push Notifications**: Notify users of booking updates
3. **QR Codes**: Generate and scan parking permits
4. **Offline Support**: Cache data for offline viewing
5. **Payment Integration**: Complete Stripe payment flow

## Support

For issues or questions:
- Check the main project README
- Review Firebase console logs
- Check Expo documentation: https://docs.expo.dev

## License

Same as main ParkPass project
