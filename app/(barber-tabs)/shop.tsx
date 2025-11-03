import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Scissors, Clock, MapPin, CreditCard as Edit, Save } from 'lucide-react-native';

export default function BarberShopScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [shopData, setShopData] = useState({
    name: "Royal Cuts",
    landmark: "Near Metro Station, Connaught Place",
    openTime: "09:00",
    closeTime: "20:00",
    services: ["Haircut", "Beard Trim", "Shave", "Hair Wash"],
    slotsPerHour: 4
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
  };

  const services = [
    { name: "Haircut", price: "₹350", duration: "30 min" },
    { name: "Beard Trim", price: "₹300", duration: "15 min" },
    { name: "Shave", price: "₹400", duration: "20 min" },
    { name: "Hair Wash", price: "₹300", duration: "10 min" }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? (
            <Save size={20} color="#673AB7" strokeWidth={2} />
          ) : (
            <Edit size={20} color="#673AB7" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.shopCard}>
          <View style={styles.shopHeader}>
            <View style={styles.shopIcon}>
              <Scissors size={32} color="#673AB7" strokeWidth={2} />
            </View>
            <View style={styles.shopInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={shopData.name}
                  onChangeText={(text) => setShopData(prev => ({ ...prev, name: text }))}
                />
              ) : (
                <Text style={styles.shopName}>{shopData.name}</Text>
              )}
              <View style={styles.locationRow}>
                <MapPin size={16} color="#757575" strokeWidth={2} />
                {isEditing ? (
                  <TextInput
                    style={[styles.editInput, styles.locationInput]}
                    value={shopData.landmark}
                    onChangeText={(text) => setShopData(prev => ({ ...prev, landmark: text }))}
                    multiline
                  />
                ) : (
                  <Text style={styles.shopLocation}>{shopData.landmark}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.hoursContainer}>
            <View style={styles.timeRow}>
              <Clock size={20} color="#673AB7" strokeWidth={2} />
              <Text style={styles.timeLabel}>Open:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.timeInput}
                  value={shopData.openTime}
                  onChangeText={(text) => setShopData(prev => ({ ...prev, openTime: text }))}
                />
              ) : (
                <Text style={styles.timeValue}>{shopData.openTime} AM</Text>
              )}
            </View>
            <View style={styles.timeRow}>
              <Clock size={20} color="#673AB7" strokeWidth={2} />
              <Text style={styles.timeLabel}>Close:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.timeInput}
                  value={shopData.closeTime}
                  onChangeText={(text) => setShopData(prev => ({ ...prev, closeTime: text }))}
                />
              ) : (
                <Text style={styles.timeValue}>{shopData.closeTime} PM</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services & Pricing</Text>
          {services.map((service, index) => (
            <View key={index} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
              </View>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capacity Settings</Text>
          <View style={styles.capacityCard}>
            <Text style={styles.capacityLabel}>Slots per hour:</Text>
            {isEditing ? (
              <TextInput
                style={styles.capacityInput}
                value={shopData.slotsPerHour.toString()}
                onChangeText={(text) => setShopData(prev => ({ ...prev, slotsPerHour: parseInt(text) || 4 }))}
                keyboardType="number-pad"
              />
            ) : (
              <Text style={styles.capacityValue}>{shopData.slotsPerHour}</Text>
            )}
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  editButton: {
    padding: 8,
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
    alignItems: 'center',
  },
  shopIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(103, 58, 183, 0.1)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  shopLocation: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    flex: 1,
  },
  editInput: {
    fontSize: 16,
    color: '#212121',
    borderBottomWidth: 1,
    borderBottomColor: '#CDDC39',
    paddingVertical: 4,
    marginBottom: 8,
  },
  locationInput: {
    marginLeft: 8,
    flex: 1,
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
    fontSize: 18,
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  hoursContainer: {
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeLabel: {
    fontSize: 16,
    color: '#212121',
    minWidth: 50,
  },
  timeValue: {
    fontSize: 16,
    color: '#673AB7',
    fontWeight: '500',
  },
  timeInput: {
    fontSize: 16,
    color: '#673AB7',
    borderBottomWidth: 1,
    borderBottomColor: '#CDDC39',
    paddingVertical: 4,
    minWidth: 80,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#757575',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#673AB7',
  },
  capacityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityLabel: {
    fontSize: 16,
    color: '#212121',
  },
  capacityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#673AB7',
  },
  capacityInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#673AB7',
    borderBottomWidth: 1,
    borderBottomColor: '#CDDC39',
    paddingVertical: 4,
    textAlign: 'right',
    minWidth: 40,
  },
});