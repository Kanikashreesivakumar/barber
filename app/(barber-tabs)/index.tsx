import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Users, Clock, CircleCheck as CheckCircle, Power } from 'lucide-react-native';

const queueData = [
  {
    id: 1,
    customerName: "Amit Sharma",
    phoneNumber: "+91 98765 43210",
    bookedTime: "2:30 PM",
    estimatedTime: "2:45 PM",
    position: 1,
    status: "waiting"
  },
  {
    id: 2,
    customerName: "Vikram Singh",
    phoneNumber: "+91 87654 32109",
    bookedTime: "3:00 PM",
    estimatedTime: "3:15 PM",
    position: 2,
    status: "waiting"
  },
  {
    id: 3,
    customerName: "Rahul Gupta",
    phoneNumber: "+91 76543 21098",
    bookedTime: "3:30 PM",
    estimatedTime: "3:45 PM",
    position: 3,
    status: "waiting"
  }
];

export default function BarberDashboardScreen() {
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [queue, setQueue] = useState(queueData);

  const markAsServed = (customerId: number) => {
    setQueue(prev => prev.filter(customer => customer.id !== customerId));
  };

  const toggleShopStatus = () => {
    setIsShopOpen(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.shopName}>Royal Cuts</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            <Power size={24} color={isShopOpen ? '#4CAF50' : '#F44336'} strokeWidth={2} />
            <Text style={styles.statusText}>
              Shop is {isShopOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
          <Switch
            value={isShopOpen}
            onValueChange={toggleShopStatus}
            trackColor={{ false: '#BDBDBD', true: '#CDDC39' }}
            thumbColor={isShopOpen ? '#673AB7' : '#F4F3F4'}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users size={20} color="#673AB7" strokeWidth={2} />
            <Text style={styles.statNumber}>{queue.length}</Text>
            <Text style={styles.statLabel}>In Queue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Clock size={20} color="#673AB7" strokeWidth={2} />
            <Text style={styles.statNumber}>15m</Text>
            <Text style={styles.statLabel}>Avg Wait</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <CheckCircle size={20} color="#4CAF50" strokeWidth={2} />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Served Today</Text>
          </View>
        </View>
      </View>

      <View style={styles.queueHeader}>
        <Text style={styles.queueTitle}>Current Queue</Text>
        {queue.length > 0 && (
          <Text style={styles.queueCount}>{queue.length} customers</Text>
        )}
      </View>

      <ScrollView style={styles.queueContainer} showsVerticalScrollIndicator={false}>
        {queue.length === 0 ? (
          <View style={styles.emptyQueue}>
            <Users size={48} color="#BDBDBD" strokeWidth={2} />
            <Text style={styles.emptyTitle}>No customers in queue</Text>
            <Text style={styles.emptySubtitle}>
              {isShopOpen ? 'Waiting for customers to book...' : 'Shop is currently closed'}
            </Text>
          </View>
        ) : (
          queue.map((customer) => (
            <View key={customer.id} style={styles.customerCard}>
              <View style={styles.customerInfo}>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>#{customer.position}</Text>
                </View>
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{customer.customerName}</Text>
                  <Text style={styles.customerPhone}>{customer.phoneNumber}</Text>
                  <View style={styles.timeInfo}>
                    <Clock size={14} color="#757575" strokeWidth={2} />
                    <Text style={styles.timeText}>
                      Booked: {customer.bookedTime} • Est: {customer.estimatedTime}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.servedButton}
                onPress={() => markAsServed(customer.id)}
              >
                <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.servedButtonText}>Mark Served</Text>
              </TouchableOpacity>
            </View>
          ))
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
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    color: '#673AB7',
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#673AB7',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  queueCount: {
    fontSize: 14,
    color: '#757575',
  },
  queueContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionBadge: {
    width: 40,
    height: 40,
    backgroundColor: '#673AB7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  servedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  servedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyQueue: {
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