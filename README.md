# Smart Car Parking System (ParkPass)

A real-time parking management system built with React, Firebase, and Google Maps API.

## 🚀 Features

- **Real-Time Parking Updates** - Live parking availability using Firebase onSnapshot()
- **Intelligent Recommendations** - Haversine formula-based nearest parking finder
- **Digital Parking Permits** - QR code-based parking permits
- **Google Maps Integration** - Interactive maps with parking markers and navigation
- **Admin Dashboard** - Complete parking space and user management
- **Secure Authentication** - Email/Password and Google OAuth
- **Role-Based Access** - User and Admin roles with proper permissions
- **Booking Management** - Complete booking lifecycle with payment tracking

## 📋 Architecture

### Service Modules

- **Auth Module** (`src/services/authService.js`) - Authentication and user management
- **Parking Module** (`src/services/parkingService.js`) - Real-time parking space operations
- **Booking Module** (`src/services/bookingService.js`) - Booking transactions and history
- **Recommendation Engine** (`src/services/recommendationService.js`) - Smart parking suggestions
- **Permit Service** (`src/services/permitService.js`) - Digital permit generation
- **Navigation Service** (`src/services/navigationService.js`) - Google Maps integration
- **Admin Service** (`src/services/adminService.js`) - Admin operations

### Firestore Collections

- **Users** - User profiles and authentication data
- **ParkingSpaces** - Parking locations with real-time availability
- **ParkingHistory** - Booking records and history


## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, TailwindCSS
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Maps**: Google Maps JavaScript API
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm
- Firebase project
- Google Maps API key

### Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd parkpass-firebase
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. **Deploy Firestore security rules**
```bash
firebase deploy --only firestore:rules
```

5. **Run the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Create Firestore database
4. Enable Storage for parking images
5. Copy configuration to `.env` file

### Google Maps Setup

1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API and Places API
3. Add API key to `.env` file

### Create Admin User

After first login, manually update user role in Firestore:

```javascript
// In Firebase Console -> Firestore
Users/{userId}/role = "admin"
```

## 📱 Usage

### For Users

1. **Sign Up/Login** - Create account or sign in with Google
2. **Browse Parking** - View available parking spaces on map
3. **Get Recommendations** - See nearest parking based on your location
4. **Book Parking** - Select time slot and complete booking
5. **Get Permit** - Receive digital parking permit with QR code
6. **Navigate** - Get directions to your parking space

### For Admins

1. **Manage Parking Spaces** - Add, edit, delete parking locations
2. **View Bookings** - Monitor all bookings in real-time
3. **Manage Users** - View and manage user accounts
4. **View Analytics** - Track revenue and usage statistics

## 🏗️ Project Structure

```
parkpass-firebase/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ParkingMap.jsx
│   │   ├── ParkingSpaceCard.jsx
│   │   ├── PermitDisplay.jsx
│   │   └── Navbar.jsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ParkingContext.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useRealTimeBookings.js
│   │   └── useParkingRecommendations.js
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── BookingPage.jsx
│   ├── services/            # Business logic modules
│   │   ├── authService.js
│   │   ├── parkingService.js
│   │   ├── bookingService.js
│   │   ├── recommendationService.js
│   │   ├── permitService.js
│   │   ├── navigationService.js
│   │   └── adminService.js
│   ├── firebase.js          # Firebase configuration
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── firestore.rules          # Firestore security rules
├── DATABASE_STRUCTURE.md    # Database schema documentation
├── REFACTORING_GUIDE.md     # Refactoring documentation
└── package.json
```

## 🔐 Security

- Firestore security rules enforce role-based access
- User data is protected and only accessible by owner or admin
- Parking spaces are publicly readable but admin-only writable
- Bookings are user-specific with admin oversight
- All sensitive operations use Firebase Authentication

## 🚀 Deployment

### Build for production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy
```

## 📊 Key Features Implementation

### Real-Time Updates

All data uses Firebase `onSnapshot()` for live updates:

```javascript
import { watchParkingSpaces } from './services/parkingService';

watchParkingSpaces((spaces) => {
  // Automatically updates when data changes
  setParkingSpaces(spaces);
});
```

### Recommendation Engine

Uses Haversine formula for accurate distance calculation:

```javascript
import { getRecommendedSpaces } from './services/recommendationService';

const recommended = getRecommendedSpaces(parkingSpaces, userLocation, {
  maxDistance: 5,
  sortBy: 'distance'
});
```

### Digital Permits

Generates unique permits with QR codes:

```javascript
import { generateParkingPermit } from './services/permitService';

const permit = await generateParkingPermit(bookingData);
// Returns permit with unique ID and QR code data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of a Final Year Project.

## 📧 Contact

For questions or support, please contact Dev Joash.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Google Maps for location services
- React community for excellent tools and libraries

Made with ❤️ by Malila Nyamai • Frontend Developer & Co-founder
