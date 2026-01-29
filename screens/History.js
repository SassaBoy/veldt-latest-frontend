import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HistoryPage = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Recent');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [history, setHistory] = useState([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const statusMap = {
      Recent: 'all',
      Completed: 'completed',
      Cancelled: 'rejected',
    };
    await fetchHistoryData(statusMap[selectedTab]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHistoryData('all');
  }, []);

  const fetchHistoryData = async (status = 'all') => {
    const cacheKey = `history_${status}`;
    try {
      setLoading(true);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        setHistory(JSON.parse(cachedData));
      }

      const token = await AsyncStorage.getItem('authToken');
      const endpoint = {
        all: 'https://service-booking-backend-eb9i.onrender.com/api/book/history/all',
        completed: 'https://service-booking-backend-eb9i.onrender.com/api/book/history/completed',
        rejected: 'https://service-booking-backend-eb9i.onrender.com/api/book/history/rejected',
      }[status];

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const mappedData = response.data.data.map((booking) => ({
          id: booking._id,
          serviceName: booking.serviceName,
          date: booking.date,
          time: booking.time,
          price: booking.price !== undefined && booking.price !== null ? `N$ ${booking.price}` : 'N$ 0.00',
          status: booking.status || 'pending',
          createdAt: booking.createdAt || new Date().toISOString(),
          providerId: booking.providerId
            ? {
                name: booking.providerId.name || 'Unknown Provider',
                email: booking.providerId.email || 'Not Provided',
                phone: booking.providerId.phone || 'Not Provided',
                profileImage: booking.providerId.profileImage || null,
              }
            : {
                name: 'Unknown Provider',
                email: 'Not Provided',
                phone: 'Not Provided',
                profileImage: null,
              },
        }));

        const sortedData = mappedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistory(sortedData);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(sortedData));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    const statusMap = {
      Recent: 'all',
      Completed: 'completed',
      Cancelled: 'rejected',
    };
    fetchHistoryData(statusMap[tab]);
  };

  // Restored your Original logic for Buttons
  const handleDeleteRejectedRecord = async (id) => {
    Alert.alert('Remove Record', 'Are you sure you want to remove this rejected booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.put(`https://service-booking-backend-eb9i.onrender.com/api/book/rejected/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
              setHistory(history.filter((s) => s.id !== id));
              Alert.alert('Success', 'Record removed.');
            }
          } catch (e) { Alert.alert('Error', 'Failed to remove.'); }
        },
      },
    ]);
  };

  const handleCancelBooking = async (id) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.put(`https://service-booking-backend-eb9i.onrender.com/api/book/cancel/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
              setHistory(history.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
              Alert.alert('Success', 'Booking cancelled.');
            }
          } catch (e) { Alert.alert('Error', 'Failed to cancel.'); }
        },
      },
    ]);
  };

  const handleDeleteRecord = async (id) => {
    Alert.alert('Remove Record', 'Remove this completed booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.put(`https://service-booking-backend-eb9i.onrender.com/api/book/completed/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
              setHistory(history.filter(s => s.id !== id));
              Alert.alert('Success', 'Record removed.');
            }
          } catch (e) { Alert.alert('Error', 'Failed to remove.'); }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    const lower = status?.toLowerCase().trim() || '';
    if (lower.includes('pending')) return '#FFC107';
    if (lower.includes('completed')) return '#4CAF50';
    if (lower.includes('rejected') || lower.includes('cancelled')) return '#F44336';
    return '#757575';
  };

  const renderHistoryItem = ({ item }) => {
    const isPending = item.status.toLowerCase().includes('pending');
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => { setSelectedService(item); setDetailsVisible(true); }}
      >
        <View style={styles.cardContent}>
          <Image
            source={{
              uri: item.providerId?.profileImage
                ? `https://service-booking-backend-eb9i.onrender.com/${item.providerId.profileImage.replace(/\\/g, '/')}`
                : 'https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png',
            }}
            style={styles.avatar}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.providerName} numberOfLines={1}>{item.providerId?.name}</Text>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <View style={styles.dateTimeRow}>
               <MaterialIcons name="event" size={14} color="#6c757d" />
               <Text style={styles.dateTimeText}>{new Date(item.date).toLocaleDateString()}</Text>
               <MaterialIcons name="access-time" size={14} color="#6c757d" style={{marginLeft: 10}} />
               <Text style={styles.dateTimeText}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#adb5bd" />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>{item.price}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Restore original action buttons */}
        <View style={styles.actionSection}>
          <View style={styles.separator} />
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isPending ? '#FF9800' : '#F44336' }]}
            onPress={() => isPending ? handleCancelBooking(item.id) : (item.status.toLowerCase().includes('completed') ? handleDeleteRecord(item.id) : handleDeleteRejectedRecord(item.id))}
          >
            <MaterialIcons name={isPending ? 'cancel' : 'delete'} size={18} color="#fff" />
            <Text style={styles.actionButtonText}>{isPending ? 'Cancel Booking' : 'Remove Record'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredHistory = useMemo(() => {
    return history.filter((service) => {
      const status = service?.status?.toLowerCase() || '';
      if (selectedTab === 'Recent') return status.includes('pending');
      if (selectedTab === 'Completed') return status.includes('completed');
      if (selectedTab === 'Cancelled') return status.includes('rejected');
      return false;
    });
  }, [history, selectedTab]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredHistory.length}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {['Recent', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        )}
      />

      {loading && history.length === 0 && (
        <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#1a237e" /></View>
      )}

      {/* FULL MODAL RESTORED */}
      <Modal visible={detailsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedService?.providerId?.profileImage 
                ? `https://service-booking-backend-eb9i.onrender.com/${selectedService.providerId.profileImage.replace(/\\/g, '/')}`
                : 'https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png' }}
              style={styles.modalAvatar}
            />
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalProviderName}>{selectedService?.providerId?.name}</Text>
              <Text style={styles.modalServiceName}>{selectedService?.serviceName}</Text>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalHighlightRow}>
                <View><Text style={styles.modalLabel}>Date</Text><Text style={styles.modalValue}>{selectedService?.date ? new Date(selectedService.date).toLocaleDateString() : 'N/A'}</Text></View>
                <View><Text style={styles.modalLabel}>Time</Text><Text style={styles.modalValue}>{selectedService?.time ? new Date(selectedService.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</Text></View>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalDetailRow}>
                <MaterialIcons name="phone" size={20} color="#1a237e" />
                <View style={{marginLeft: 15}}><Text style={styles.modalLabel}>Phone</Text><Text style={styles.modalValue}>{selectedService?.providerId?.phone}</Text></View>
              </View>
              <View style={styles.modalDetailRow}>
                <MaterialIcons name="mail" size={20} color="#1a237e" />
                <View style={{marginLeft: 15}}><Text style={styles.modalLabel}>Email</Text><Text style={styles.modalValue}>{selectedService?.providerId?.email}</Text></View>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalHighlightRow}>
                <View><Text style={styles.modalLabel}>Price</Text><Text style={styles.modalPrice}>{selectedService?.price}</Text></View>
                <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedService?.status) + '20' }]}>
                  <Text style={[styles.modalStatusText, { color: getStatusColor(selectedService?.status) }]}>{selectedService?.status?.toUpperCase()}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setDetailsVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#1a237e', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 24, fontWeight: '700', color: '#fff' },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  countText: { color: '#fff', fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#1a237e' },
  tabText: { color: '#6c757d', fontWeight: '600' },
  activeTabText: { color: '#1a237e', fontWeight: 'bold' },
  listContainer: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardContent: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },
  infoContainer: { flex: 1, marginLeft: 15 },
  providerName: { fontSize: 17, fontWeight: 'bold', color: '#212529' },
  serviceName: { fontSize: 14, color: '#495057', marginTop: 2 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  dateTimeText: { fontSize: 12, color: '#6c757d', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 12, alignItems: 'center' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#1a237e' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: 'bold' },
  actionSection: { paddingHorizontal: 15, paddingBottom: 15 },
  separator: { height: 1, backgroundColor: '#f1f3f5', marginBottom: 12 },
  actionButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 20, paddingTop: 70, padding: 20 },
  modalAvatar: { position: 'absolute', top: -50, alignSelf: 'center', width: 100, height: 100, borderRadius: 50, borderWidth: 5, borderColor: '#fff' },
  modalHeaderText: { alignItems: 'center', marginBottom: 20 },
  modalProviderName: { fontSize: 22, fontWeight: 'bold', color: '#1a237e' },
  modalServiceName: { fontSize: 16, color: '#6c757d' },
  modalHighlightRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  modalLabel: { fontSize: 12, color: '#adb5bd', fontWeight: 'bold' },
  modalValue: { fontSize: 16, color: '#212529', fontWeight: '600' },
  modalDivider: { height: 1, backgroundColor: '#f1f3f5', marginVertical: 15 },
  modalPrice: { fontSize: 24, fontWeight: 'bold', color: '#1a237e' },
  modalStatusBadge: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  modalStatusText: { fontWeight: 'bold', fontSize: 12 },
  modalCloseButton: { backgroundColor: '#1a237e', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  modalCloseButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#adb5bd', fontSize: 16 }
});

export default HistoryPage;