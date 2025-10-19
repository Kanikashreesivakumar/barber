import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, MapPin, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';

const bookings = [
  {
    id: 1,
    shopName: "Royal Cuts",
    landmark: "Connaught Place",
    date: "Today",
    time: "3:30 PM",
    queuePosition: 2,
    status: "confirmed",
    estimatedWait: "10 mins"
  },
  {
    id: 2,
    shopName: "Modern Salon",
    landmark: "Karol Bagh",
    date: "Yesterday",
    time: "2:00 PM",
    status: "completed"
  },
  {
    id: 3,
    shopName: "Classic Barber",
    landmark: "Rajouri Garden",
    date: "Dec 20, 2024",
    time: "11:00 AM",
    status: "cancelled"
  }
];

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const upcomingBookings = bookings.filter(booking => booking.status === 'confirmed');
  const historyBookings = bookings.filter(booking => booking.status !== 'confirmed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Clock size={16} stroke="#673AB7" strokeWidth={2} />;
      case 'completed':
        return <CheckCircle size={16} stroke="#4CAF50" strokeWidth={2} />;
      case 'cancelled':
        return <XCircle size={16} stroke="#F44336" strokeWidth={2} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#673AB7';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {(activeTab === 'upcoming' ? upcomingBookings : historyBookings).map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.shopName}>{booking.shopName}</Text>
              <View style={styles.statusContainer}>
                {getStatusIcon(booking.status)}
                <Text style={[styles.status, { color: getStatusColor(booking.status) }]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.bookingInfo}>
              <MapPin size={16} stroke="#757575" strokeWidth={2} />
              <Text style={styles.landmark}>{booking.landmark}</Text>
            </View>

            <View style={styles.bookingDetails}>
              <Text style={styles.dateTime}>{booking.date} at {booking.time}</Text>
            </View>

            {booking.status === 'confirmed' && booking.queuePosition && (
              <View style={styles.queueInfo}>
                <View style={styles.queueBadge}>
                  <Text style={styles.queueText}>Position #{booking.queuePosition}</Text>
                </View>
                <Text style={styles.estimatedWait}>Est. wait: {booking.estimatedWait}</Text>
              </View>
            )}

            {booking.status === 'confirmed' && (
              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {(activeTab === 'upcoming' ? upcomingBookings : historyBookings).length === 0 && (
          <View style={styles.emptyState}>
            <Clock size={48} color="#090505ff" strokeWidth={2} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No booking history'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming' 
                ? 'Book your first appointment from the Home tab'
                : 'Your completed bookings will appear here'
              }
            </Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#673AB7',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  landmark: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    flex: 1,
  },
  bookingDetails: {
    marginBottom: 16,
  },
  dateTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
  },
  queueBadge: {
    backgroundColor: '#673AB7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  queueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  estimatedWait: {
    fontSize: 14,
    color: '#673AB7',
    fontWeight: '500',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});