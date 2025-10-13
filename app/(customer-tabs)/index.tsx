import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
// If the above does not work, try:
// import * as Router from 'expo-router';
// and then replace all `useRouter()` with `Router.useRouter()`
import { Search, MapPin, Clock, Star, Scissors } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';

const barbershops = [
  {
    id: 1,
    name: "Royal Cuts",
    landmark: "Near Metro Station, Connaught Place",
    waitTime: "15 mins",
    rating: 4.5,
    status: "Open",
    distance: "0.5 km"
  },
  {
    id: 2,
    name: "Modern Salon",
    landmark: "Karol Bagh Market",
    waitTime: "25 mins",
    rating: 4.2,
    status: "Open",
    distance: "1.2 km"
  },
  {
    id: 3,
    name: "Classic Barber",
    landmark: "Rajouri Garden Main Road",
    waitTime: "10 mins",
    rating: 4.7,
    status: "Open",
    distance: "2.1 km"
  },
  {
    id: 4,
    name: "Style Studio",
    landmark: "Lajpat Nagar Central Market",
    waitTime: "Closed",
    rating: 4.0,
    status: "Closed",
    distance: "3.5 km"
  }
];

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY] = useState(new Animated.Value(0));

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const filteredShops = barbershops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.landmark.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBooking = (shop: {id: number, name: string}) => {
    router.push(`/customer-tabs/booking-detail?shopId=${shop.id}&shopName=${shop.name}`);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <Animatable.View animation="fadeIn" duration={1000} style={styles.logoContainer}>
          <Scissors size={40} stroke="#FFFFFF" strokeWidth={2} />
          <Text style={styles.headerTitle}>BarberSlot</Text>
        </Animatable.View>
        <Animatable.Text animation="fadeInUp" delay={500} style={styles.headerSubtitle}>Find and book your perfect cut</Animatable.Text>
      </Animated.View>

      <Animatable.View animation="slideInUp" duration={1000} style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} stroke="#757575" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animatable.View>

      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {filteredShops.map((shop, index) => (
          <Animatable.View 
            key={shop.id} 
            animation="fadeInUp" 
            delay={index * 100}
          >
            <TouchableOpacity
              style={styles.shopCard}
              onPress={() => handleBooking(shop)}
              disabled={shop.status === 'Closed'}
            >
              <View style={styles.shopHeader}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: shop.status === 'Open' ? '#CDDC39' : '#BDBDBD' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: shop.status === 'Open' ? '#212121' : '#757575' }
                  ]}>
                    {shop.status}
                  </Text>
                </View>
              </View>

              <View style={styles.shopInfo}>
                <MapPin size={16} stroke="#757575" strokeWidth={2} />
                <Text style={styles.shopLocation}>{shop.landmark}</Text>
              </View>

              <View style={styles.shopDetails}>
                <View style={styles.detailItem}>
                  <Clock size={16} stroke="#673AB7" strokeWidth={2} />
                  <Text style={styles.waitTime}>{shop.waitTime}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Star size={16} stroke="#CDDC39" strokeWidth={2} />
                  <Text style={styles.rating}>{shop.rating}</Text>
                </View>
                <Text style={styles.distance}>{shop.distance}</Text>
              </View>

              {shop.status === 'Open' && (
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    backgroundColor: '#673AB7',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  shopLocation: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    flex: 1,
  },
  shopDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitTime: {
    fontSize: 14,
    color: '#673AB7',
    fontWeight: '600',
    marginLeft: 4,
  },
  rating: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#757575',
  },
  bookButton: {
    backgroundColor: '#CDDC39',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
});
