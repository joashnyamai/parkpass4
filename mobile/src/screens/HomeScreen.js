import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useParkingContext } from '../contexts/ParkingContext';
import ParkingCard from '../components/ParkingCard';

const HomeScreen = ({ navigation }) => {
  const { parkingSpaces, userLocation, loading, refreshLocation } = useParkingContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const filteredSpaces = useMemo(() => {
    let spaces = parkingSpaces.filter(space => {
      const matchesSearch = !searchTerm || 
        space.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.location?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    if (userLocation) {
      spaces = spaces.map(space => ({
        ...space,
        distance: space.coordinates 
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              space.coordinates.lat,
              space.coordinates.lng
            )
          : null
      })).sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return spaces;
  }, [parkingSpaces, searchTerm, userLocation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    setRefreshing(false);
  };

  const availableCount = parkingSpaces.filter(s => s.status === 'available' && s.availableSpots > 0).length;
  const avgPrice = parkingSpaces.length > 0 
    ? Math.round(parkingSpaces.reduce((sum, s) => sum + s.price, 0) / parkingSpaces.length)
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading parking spaces...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2563eb', '#1d4ed8', '#059669']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Find Your Perfect</Text>
        <Text style={styles.headerSubtitle}>Parking Spot</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location or name..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{parkingSpaces.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{availableCount}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>KES {avgPrice}</Text>
            <Text style={styles.statLabel}>Avg/hr</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Available Parking ({filteredSpaces.length})
        </Text>
        
        <FlatList
          data={filteredSpaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ParkingCard 
              space={item} 
              onPress={() => navigation.navigate('ParkingDetail', { spaceId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No parking spaces found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 20,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default HomeScreen;
