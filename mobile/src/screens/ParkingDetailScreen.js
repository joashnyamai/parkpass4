import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getParkingSpace } from '../services/parkingService';

const ParkingDetailScreen = ({ route, navigation }) => {
  const { spaceId } = route.params;
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpace();
  }, [spaceId]);

  const loadSpace = async () => {
    try {
      const data = await getParkingSpace(spaceId);
      setSpace(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load parking space');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (space?.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${space.coordinates.lat},${space.coordinates.lng}`;
      Linking.openURL(url);
    }
  };

  const handleBookNow = () => {
    navigation.navigate('Booking', { space });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!space) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Parking space not found</Text>
      </View>
    );
  }

  const isAvailable = space.status === 'available' && space.availableSpots > 0;
  const features = Array.isArray(space.features) ? space.features : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: space.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' }}
          style={styles.image}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{space.name}</Text>
              <View style={[styles.badge, isAvailable ? styles.badgeAvailable : styles.badgeFull]}>
                <Text style={styles.badgeText}>
                  {isAvailable ? `${space.availableSpots} Available` : 'Full'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.location}>{space.location}</Text>
          </View>

          <View style={styles.priceCard}>
            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              style={styles.priceGradient}
            >
              <Text style={styles.priceLabel}>Price per hour</Text>
              <Text style={styles.priceValue}>KES {space.price}</Text>
            </LinearGradient>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Spots:</Text>
              <Text style={styles.infoValue}>{space.totalSpots}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Available:</Text>
              <Text style={styles.infoValue}>{space.availableSpots}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rating:</Text>
              <Text style={styles.infoValue}>⭐ {space.rating || 4.5} ({space.totalReviews || 0} reviews)</Text>
            </View>
          </View>

          {features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureChip}>
                    <Text style={styles.featureText}>✓ {feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNavigate}
        >
          <Text style={styles.navButtonText}>📍 Navigate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bookButton, !isAvailable && styles.bookButtonDisabled]}
          onPress={handleBookNow}
          disabled={!isAvailable}
        >
          <LinearGradient
            colors={isAvailable ? ['#2563eb', '#1d4ed8'] : ['#9ca3af', '#6b7280']}
            style={styles.bookGradient}
          >
            <Text style={styles.bookButtonText}>
              {isAvailable ? 'Book Now' : 'Unavailable'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeAvailable: {
    backgroundColor: '#10b981',
  },
  badgeFull: {
    backgroundColor: '#ef4444',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    color: '#6b7280',
  },
  priceCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  priceGradient: {
    padding: 20,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  featureText: {
    fontSize: 14,
    color: '#1e40af',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bookButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookGradient: {
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ParkingDetailScreen;
