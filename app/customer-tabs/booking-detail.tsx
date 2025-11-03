import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Star, Users, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function BookingDetailScreen() {
  const router = useRouter();
  const { shopId, shopName } = useLocalSearchParams();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const shopDetails = {
    name: shopName as string,
    landmark: "Near Metro Station, Connaught Place",
    rating: 4.5,
    waitTime: "15 mins",
    queueCount: 3,
    services: ["Haircut - ₹350", "Beard Trim - ₹300", "Shave - ₹400"],
    availableSlots: [
      "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
    ]
  };

  const handleBooking = () => {
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    
    Alert.alert(
      'Booking Confirmed!',
      `Your slot is booked for ${selectedTime} at ${shopDetails.name}. You are #${shopDetails.queueCount + 1} in queue.`,
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(customer-tabs)/bookings')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#673AB7" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.shopCard}>
          <View style={styles.shopHeader}>
            <Text style={styles.shopName}>{shopDetails.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#CDDC39" strokeWidth={2} />
              <Text style={styles.rating}>{shopDetails.rating}</Text>
            </View>
          </View>

          <View style={styles.shopInfo}>
            <MapPin size={16} color="#757575" strokeWidth={2} />
            <Text style={styles.landmark}>{shopDetails.landmark}</Text>
          </View>

          <View style={styles.shopStats}>
            <View style={styles.statItem}>
              <Clock size={16} color="#673AB7" strokeWidth={2} />
              <Text style={styles.statText}>Current wait: {shopDetails.waitTime}</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={16} color="#673AB7" strokeWidth={2} />
              <Text style={styles.statText}>{shopDetails.queueCount} in queue</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {shopDetails.services.map((service, index) => (
            <Text key={index} style={styles.serviceText}>• {service}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <View style={styles.slotsGrid}>
            {shopDetails.availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotButton,
                  selectedTime === slot && styles.selectedSlot
                ]}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={[
                  styles.slotText,
                  selectedTime === slot && styles.selectedSlotText
                ]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedTime && (
          <View style={styles.confirmationCard}>
            <View style={styles.confirmationHeader}>
              <CheckCircle size={20} color="#673AB7" strokeWidth={2} />
              <Text style={styles.confirmationTitle}>Booking Summary</Text>
            </View>
            <Text style={styles.confirmationText}>
              Time: {selectedTime}
            </Text>
            <Text style={styles.confirmationText}>
              Position in queue: #{shopDetails.queueCount + 1}
            </Text>
            <Text style={styles.confirmationText}>
              Estimated wait: {parseInt(shopDetails.waitTime) + 15} mins
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.bookButton, !selectedTime && styles.disabledButton]}
          onPress={handleBooking}
          disabled={!selectedTime}
        >
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginLeft: 4,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  landmark: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    flex: 1,
  },
  shopStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 14,
    color: '#673AB7',
    fontWeight: '500',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  serviceText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
    lineHeight: 24,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotButton: {
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedSlot: {
    backgroundColor: '#673AB7',
    borderColor: '#673AB7',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  selectedSlotText: {
    color: '#FFFFFF',
  },
  confirmationCard: {
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#673AB7',
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#673AB7',
    marginLeft: 8,
  },
  confirmationText: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 4,
  },
  bookButton: {
    backgroundColor: '#CDDC39',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#CDDC39',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: '#212121',
    fontSize: 18,
    fontWeight: '600',
  },
});