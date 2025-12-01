import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ParkingDetailScreen from '../screens/ParkingDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingsListScreen from '../screens/BookingsListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ParkingDetail" 
      component={ParkingDetailScreen}
      options={{ title: 'Parking Details' }}
    />
    <Stack.Screen 
      name="Booking" 
      component={BookingScreen}
      options={{ title: 'Book Parking' }}
    />
  </Stack.Navigator>
);

const BookingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="BookingsList" 
      component={BookingsListScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
      headerShown: false,
    }}
  >
    <Tab.Screen 
      name="HomeTab" 
      component={HomeStack}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
      }}
    />
    <Tab.Screen 
      name="Bookings" 
      component={BookingsStack}
      options={{
        tabBarLabel: 'Bookings',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
