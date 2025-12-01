import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';

const BookingScreen = ({ route, navigation }) => {
  const { space } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState('2');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const calculateTotal = () => {
    const hoursNum = parseFloat(hours) || 0;
    return (space.price * hoursNum).toFixed(2);
  };

  const handleBooking = async () => {
    if (!vehicleNumber.trim()) {
      Alert.alert('Error', 'Please enter your vehicle number');
      return;
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      Alert.alert('Error', 'Please enter valid hours');
      return;
    }

    setLoading(true);
    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + hoursNum * 60 * 60 * 1000);

      const bookingData = {
        parkingSpaceId: space.id,
        parkingSpaceName: space.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalPrice: calculateTotal(),
        vehicleInfo: {
          vehicleNumber: vehicleNumber.trim()
        }
      };

      const bookingId = await createBooking(bookingData);
      
      Alert.alert(
        'Success',
        'Booking created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Bookings')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Book Parking</Text>
        <Text style={styles.headerSubtitle}>{space.name}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Vehicle Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., KAA 123A"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration (hours) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter hours"
            value={hours}
            onChangeText={setHours}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Parking Space:</Text>
            <Text style={styles.summaryValue}>{space.name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per hour:</Text>
            <Text style={styles.summaryValue}>KES {space.price}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{hours} hours</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>KES {calculateTotal()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
          disabled={loading}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.bookGradient}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.bookButtonText}>Confirm Booking</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: Payment will be processed after booking confirmation
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bookGradient: {
    padding: 18,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  note: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default BookingScreen;
