import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { ParkingProvider } from './src/contexts/ParkingContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </ParkingProvider>
    </AuthProvider>
  );
}
