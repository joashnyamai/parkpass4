import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const ParkingCard = ({ space, onPress }) => {
  const isAvailable = space.status === 'available' && space.availableSpots > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: space.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' }}
        style={styles.image}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{space.name}</Text>
          <View style={[styles.badge, isAvailable ? styles.badgeAvailable : styles.badgeFull]}>
            <Text style={styles.badgeText}>
              {isAvailable ? `${space.availableSpots} spots` : 'Full'}
            </Text>
          </View>
        </View>

        <Text style={styles.location} numberOfLines={1}>
          📍 {space.location}
        </Text>

        <View style={styles.footer}>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>⭐ {space.rating || 4.5}</Text>
            <Text style={styles.reviews}>({space.totalReviews || 0})</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>KES {space.price}</Text>
            <Text style={styles.priceUnit}>/hr</Text>
          </View>
        </View>

        {space.distance && (
          <Text style={styles.distance}>🚗 {space.distance} km away</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAvailable: {
    backgroundColor: '#10b981',
  },
  badgeFull: {
    backgroundColor: '#ef4444',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#9ca3af',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  priceUnit: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 2,
  },
  distance: {
    fontSize: 12,
    color: '#059669',
    marginTop: 8,
    fontWeight: '600',
  },
});

export default ParkingCard;
