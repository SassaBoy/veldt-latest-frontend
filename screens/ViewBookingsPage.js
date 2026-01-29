import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import moment from 'moment';

const ViewBookingsPage = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Completed');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, [selectedTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setBookings([]);
      const token = await AsyncStorage.getItem('authToken');
      const providerId = await AsyncStorage.getItem('userId');

      if (!token || !providerId) {
        Alert.alert('Authentication Error', 'You must log in to view bookings.');
        return navigation.navigate('Login');
      }

      const endpoint = `https://service-booking-backend-eb9i.onrender.com/api/book/provider/bookings/${selectedTab.toLowerCase()}`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        let sortedBookings = response.data.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (["Completed", "Rejected"].includes(selectedTab)) {
          sortedBookings = sortedBookings.filter(
            (booking) => !booking.deletedByUsers || !booking.deletedByUsers.includes(providerId)
          );
        }
        setBookings(sortedBookings || []);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch bookings.');
      }
    } catch (error) {
      console.error(`Error fetching bookings:`, error.message);
      Alert.alert('Error', 'A server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  // --- Logic Functions (Restored exactly as provided) ---
  const handleRejectBooking = async (bookingId) => {
    Alert.alert('Reject Booking', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.post(`https://service-booking-backend-eb9i.onrender.com/api/book/reject/${bookingId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) { Alert.alert('Success', 'Rejected.'); await fetchBookings(); }
          } catch (e) { Alert.alert('Error', 'Unable to reject.'); }
      }}
    ]);
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(`https://service-booking-backend-eb9i.onrender.com/api/book/accept/${bookingId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { Alert.alert('Success', 'Accepted.'); await fetchBookings(); }
    } catch (e) { Alert.alert('Error', 'Unable to accept.'); } finally { setLoading(false); }
  };

  const handleDeleteCompletedJob = async (bookingId) => {
    Alert.alert('Delete Completed Job', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.put(`https://service-booking-backend-eb9i.onrender.com/api/book/completed/${bookingId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) { Alert.alert('Success', 'Deleted.'); await fetchBookings(); }
          } catch (e) { Alert.alert('Error', 'Unable to delete.'); }
      }}
    ]);
  };

  const handleDeleteRejectedRecord = async (bookingId) => {
    Alert.alert('Delete Rejected Record', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.put(`https://service-booking-backend-eb9i.onrender.com/api/book/rejected/${bookingId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) { Alert.alert('Success', 'Deleted.'); await fetchBookings(); }
          } catch (e) { Alert.alert('Error', 'Unable to delete.'); }
      }}
    ]);
  };

  const handleCompleteJob = async (bookingId) => {
    Alert.alert('Complete Job', 'Mark as completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.post(`https://service-booking-backend-eb9i.onrender.com/api/book/complete/${bookingId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) { Alert.alert('Success', 'Job completed.'); await fetchBookings(); }
          } catch (e) { Alert.alert('Error', 'Unable to complete.'); }
      }}
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#2E7D32';
      case 'Confirmed': return '#4CAF50';
      case 'Pending': return '#FFC107';
      case 'Rejected': return '#E53935';
      default: return '#757575';
    }
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => { setSelectedBooking(item); setDetailsVisible(true); }}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeaderContainer}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.profileImage ? `https://service-booking-backend-eb9i.onrender.com/${item.profileImage}` : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png" }}
            style={styles.profileImage}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.clientName} numberOfLines={1}>{item.clientName}</Text>
            <View style={styles.serviceBadge}>
              <Text style={styles.serviceName}>{item.serviceName}</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#1a237e" />
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color="#5c6bc0" />
          <Text style={styles.detailText}>
            {moment(item.date).format('ddd, MMM D')} • {moment(item.time, 'HH:mm').format('hh:mm A')}
          </Text>
          <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusTagText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {selectedTab === 'Pending' && (
          <>
            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleRejectBooking(item.id)}>
              <MaterialIcons name="close" size={18} color="#fff" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleAcceptBooking(item.id)}>
              <MaterialIcons name="check" size={18} color="#fff" />
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </>
        )}

        {selectedTab === 'Confirmed' && (
          <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={() => handleCompleteJob(item.id)}>
            <MaterialIcons name="done-all" size={18} color="#fff" />
            <Text style={styles.buttonText}>Complete Job</Text>
          </TouchableOpacity>
        )}

        {(selectedTab === 'Completed' || selectedTab === 'Rejected') && (
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => selectedTab === 'Completed' ? handleDeleteCompletedJob(item.id) : handleDeleteRejectedRecord(item.id)}>
            <MaterialIcons name="delete-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>{selectedTab === 'Completed' ? 'Delete Job' : 'Remove'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Bookings</Text>
        <View style={styles.bookingCount}>
          <Text style={styles.countText}>{bookings.length}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {['Completed', 'Confirmed', 'Pending', 'Rejected'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, selectedTab === tab && styles.activeTabItem]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1a237e']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-note" size={80} color="#e0e0e0" />
            <Text style={styles.emptyText}>No {selectedTab.toLowerCase()} bookings</Text>
          </View>
        }
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1a237e" />
            <Text style={styles.loadingTextSmall}>Updating Bookings...</Text>
          </View>
        </View>
      )}

      {/* FULL MODAL (Restored & Improved Design) */}
      <Modal visible={detailsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderDecor} />
            <Image
              source={{ uri: selectedBooking?.profileImage ? `https://service-booking-backend-eb9i.onrender.com/${selectedBooking.profileImage}` : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png" }}
              style={styles.modalImage}
            />
            
            <Text style={styles.modalTitle}>{selectedBooking?.clientName}</Text>
            <View style={[styles.statusTag, { alignSelf: 'center', marginBottom: 20, backgroundColor: getStatusColor(selectedBooking?.status) + '20' }]}>
                <Text style={{color: getStatusColor(selectedBooking?.status), fontWeight: 'bold'}}>{selectedBooking?.status?.toUpperCase()}</Text>
            </View>

            <View style={styles.modalSection}>
              <DetailItem icon="work" label="Service" value={selectedBooking?.serviceName} />
              <DetailItem icon="payments" label="Price" value={selectedBooking?.price ? `N$ ${selectedBooking.price}` : "Not Set"} />
              <DetailItem icon="email" label="Email" value={selectedBooking?.email} />
              <DetailItem icon="phone" label="Phone" value={selectedBooking?.phone} />
              <DetailItem icon="schedule" label="Schedule" value={`${moment(selectedBooking?.date).format('LL')} at ${moment(selectedBooking?.time, 'HH:mm').format('hh:mm A')}`} />
              <DetailItem icon="location-on" label="Address" value={selectedBooking?.address || "No address provided"} />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setDetailsVisible(false)}>
              <Text style={styles.closeButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper component for Modal rows
const DetailItem = ({ icon, label, value }) => (
  <View style={styles.modalRow}>
    <View style={styles.iconCircle}>
      <MaterialIcons name={icon} size={18} color="#1a237e" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.modalLabelText}>{label}</Text>
      <Text style={styles.modalValueText}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { 
    backgroundColor: '#1a237e', 
    paddingTop: Platform.OS === 'ios' ? 20 : 50, 
    paddingBottom: 25, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#fff' },
  bookingCount: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 },
  countText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', marginTop: -10, marginHorizontal: 15, borderRadius: 12, elevation: 4, shadowOpacity: 0.1 },
  tabItem: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTabItem: { borderBottomWidth: 3, borderBottomColor: '#1a237e' },
  tabText: { fontSize: 13, color: '#9e9e9e', fontWeight: '600' },
  activeTabText: { color: '#1a237e', fontWeight: 'bold' },
  listContent: { padding: 15, paddingBottom: 100 },
  bookingCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 16, 
    overflow: 'hidden', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#edf0f2'
  },
  cardHeaderContainer: { backgroundColor: '#fafbff', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f2f5' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#e8eaf6' },
  headerTextContainer: { flex: 1 },
  clientName: { fontSize: 17, fontWeight: 'bold', color: '#1a237e' },
  serviceBadge: { backgroundColor: '#e8eaf6', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  serviceName: { fontSize: 12, color: '#3f51b5', fontWeight: '600' },
  detailsContainer: { padding: 15 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { marginLeft: 8, fontSize: 14, color: '#455a64', flex: 1, fontWeight: '500' },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusTagText: { fontSize: 11, fontWeight: 'bold' },
  actionContainer: { flexDirection: 'row', gap: 10, padding: 15, paddingTop: 0 },
  actionButton: { flex: 1, flexDirection: 'row', height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 5 },
  acceptButton: { backgroundColor: '#43a047' },
  rejectButton: { backgroundColor: '#e53935' },
  completeButton: { backgroundColor: '#1a237e' },
  deleteButton: { backgroundColor: '#546e7a' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  tapHint: { fontSize: 11, color: '#bdc3c7', textAlign: 'center', paddingBottom: 10, fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#95a5a6', fontSize: 16, marginTop: 10 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loadingCard: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center' },
  loadingTextSmall: { marginTop: 10, color: '#1a237e', fontWeight: '600' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 35, 126, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, width: '100%', maxHeight: '85%' },
  modalHeaderDecor: { width: 40, height: 5, backgroundColor: '#e0e0e0', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  modalImage: { width: 90, height: 90, borderRadius: 45, alignSelf: 'center', marginBottom: 15, borderWidth: 4, borderColor: '#fff', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a237e', textAlign: 'center', marginBottom: 5 },
  modalSection: { marginTop: 10 },
  modalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  modalLabelText: { fontSize: 12, color: '#9e9e9e', fontWeight: 'bold', textTransform: 'uppercase' },
  modalValueText: { fontSize: 15, color: '#2c3e50', fontWeight: '600' },
  closeButton: { backgroundColor: '#1a237e', padding: 16, borderRadius: 15, marginTop: 10, marginBottom: 20 },
  closeButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});

export default ViewBookingsPage;