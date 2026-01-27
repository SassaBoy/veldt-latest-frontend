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

      // Load cached data instantly
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        setHistory(JSON.parse(cachedData));
      }

      // Fetch fresh data
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

  const handleDeleteRejectedRecord = async (id) => {
    Alert.alert(
      'Remove Record',
      'Are you sure you want to remove this rejected booking from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await axios.put(
                `https://service-booking-backend-eb9i.onrender.com/api/book/rejected/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.success) {
                const updatedHistory = history.filter((service) => service.id !== id);
                setHistory(updatedHistory);
                await AsyncStorage.setItem('history_all', JSON.stringify(updatedHistory));
                await AsyncStorage.setItem('history_rejected', JSON.stringify(updatedHistory.filter((item) => item.status.toLowerCase().includes('rejected'))));
                Alert.alert('Success', 'Record removed from history.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove record.');
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = async (id) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await axios.put(
                `https://service-booking-backend-eb9i.onrender.com/api/book/cancel/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.success) {
                setHistory((prev) =>
                  prev.map((service) =>
                    service.id === id ? { ...service, status: 'rejected' } : service
                  )
                );
                Alert.alert('Success', 'Booking cancelled.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRecord = async (id) => {
    Alert.alert(
      'Remove Record',
      'Are you sure you want to remove this completed booking from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await axios.put(
                `https://service-booking-backend-eb9i.onrender.com/api/book/completed/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.success) {
                const updatedHistory = history.filter((service) => service.id !== id);
                setHistory(updatedHistory);
                await AsyncStorage.setItem('history_all', JSON.stringify(updatedHistory));
                await AsyncStorage.setItem('history_completed', JSON.stringify(updatedHistory.filter((item) => item.status.toLowerCase().includes('completed'))));
                Alert.alert('Success', 'Record removed from history.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove record.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    if (!status) return '#757575';
    const lower = status.toLowerCase().trim();
    if (lower.includes('pending')) return '#FFC107';   // Amber
    if (lower.includes('completed')) return '#4CAF50'; // Green
    if (lower.includes('rejected') || lower.includes('cancelled')) return '#F44336'; // Red
    return '#757575';
  };

  const renderHistoryItem = ({ item }) => {
    const isPending = item.status.toLowerCase().includes('pending');

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedService(item);
          setDetailsVisible(true);
        }}
      >
        <View style={styles.cardContent}>
          <Image
            source={{
              uri: item.providerId?.profileImage
                ? `https://service-booking-backend-eb9i.onrender.com/${item.providerId.profileImage.replace(/\\/g, '/')}`
                : 'https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png',
            }}
            defaultSource={require('../assets/default-profile.png')}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.infoContainer}>
            <Text style={styles.providerName}>{item.providerId?.name ?? 'Unknown Provider'}</Text>
            <Text style={styles.serviceName}>{item.serviceName || 'Unknown Service'}</Text>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <MaterialIcons name="calendar-today" size={16} color="#6c757d" />
                <Text style={styles.dateTimeText}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.dateTimeItem}>
                <MaterialIcons name="access-time" size={16} color="#6c757d" />
                <Text style={styles.dateTimeText}>
                  {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#adb5bd" />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>{item.price}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '30' },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {(isPending || item.status.toLowerCase().includes('completed') || item.status.toLowerCase().includes('rejected')) && (
          <View style={styles.actionSection}>
            <View style={styles.separator} />
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isPending ? '#FF9800' : '#F44336' },
              ]}
              onPress={() => {
                if (isPending) {
                  handleCancelBooking(item.id);
                } else if (item.status.toLowerCase().includes('completed')) {
                  handleDeleteRecord(item.id);
                } else {
                  handleDeleteRejectedRecord(item.id);
                }
              }}
            >
              <MaterialIcons
                name={isPending ? 'cancel' : 'delete'}
                size={22}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {isPending ? 'Cancel Booking' : 'Remove from History'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filteredHistory = useMemo(() => {
    return history.filter((service) => {
      if (!service || !service.status) return false;
      const status = service.status.toLowerCase().trim();

      switch (selectedTab) {
        case 'Recent':
          return status.includes('pending');
        case 'Completed':
          return status.includes('completed');
        case 'Cancelled':
          return status.includes('rejected');
        default:
          return false;
      }
    });
  }, [history, selectedTab]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service History</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredHistory.length} services</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {['Recent', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        initialNumToRender={8}
        maxToRenderPerBatch={12}
        windowSize={12}
        removeClippedSubviews={true}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#9e9e9e" />
            <Text style={styles.emptyText}>
              {selectedTab === 'Recent'
                ? 'No recent bookings'
                : selectedTab === 'Completed'
                ? 'No completed services yet'
                : 'No cancelled bookings'}
            </Text>
          </View>
        )}
      />

      {/* Full-screen overlay loader only when no data yet */}
      {loading && history.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a237e" />
        </View>
      )}

      <Modal visible={detailsVisible} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Image
        source={{
          uri: selectedService?.providerId?.profileImage
            ? `https://service-booking-backend-eb9i.onrender.com/${selectedService.providerId.profileImage.replace(/\\/g, '/')}`
            : 'https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png',
        }}
        defaultSource={require('../assets/default-profile.png')}
        style={styles.modalAvatar}
        resizeMode="cover"
      />

      <View style={styles.modalHeaderText}>
        <Text style={styles.modalProviderName}>
          {selectedService?.providerId?.name ?? 'Unknown Provider'}
        </Text>
        <Text style={styles.modalServiceName}>
          {selectedService?.serviceName || 'Unknown Service'}
        </Text>
      </View>

      <View style={styles.modalBody}>
        <View style={styles.modalHighlightRow}>
          <View>
            <Text style={styles.modalLabel}>Date</Text>
            <Text style={styles.modalValue}>
              {selectedService?.date ? new Date(selectedService.date).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View>
            <Text style={styles.modalLabel}>Time</Text>
            <Text style={styles.modalValue}>
              {selectedService?.time ? new Date(selectedService.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.modalDivider} />

        <View style={styles.modalDetailRow}>
          <MaterialIcons name="phone" size={22} color="#1a237e" />
          <View style={styles.modalDetailTextContainer}>
            <Text style={styles.modalLabel}>Phone</Text>
            <Text style={styles.modalValue}>{selectedService?.providerId?.phone || 'Not Provided'}</Text>
          </View>
        </View>

        <View style={styles.modalDetailRow}>
          <MaterialIcons name="mail" size={22} color="#1a237e" />
          <View style={styles.modalDetailTextContainer}>
            <Text style={styles.modalLabel}>Email</Text>
            <Text style={styles.modalValue}>{selectedService?.providerId?.email ?? 'Not Provided'}</Text>
          </View>
        </View>

        <View style={styles.modalDivider} />

        <View style={styles.modalHighlightRow}>
          <View>
            <Text style={styles.modalLabel}>Price</Text>
            <Text style={styles.modalPrice}>{selectedService?.price || 'N$ 0.00'}</Text>
          </View>
          <View
            style={[
              styles.modalStatusBadge,
              { backgroundColor: getStatusColor(selectedService?.status) + '20' },
            ]}
          >
            <Text style={[styles.modalStatusText, { color: getStatusColor(selectedService?.status) }]}>
              {selectedService?.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setDetailsVisible(false)}
      >
        <Text style={styles.modalCloseButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  countText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1a237e',
  },
  tabText: {
    fontSize: 15,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#1a237e',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e9ecef',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  serviceName: {
    fontSize: 16,
    color: '#495057',
    marginTop: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9e9e9e',
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingTop: 80, // Space for overlapping avatar
    paddingHorizontal: 24,
    paddingBottom: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    overflow: 'visible', // Critical: allows avatar to overlap without clipping
  },
  modalAvatar: {
    position: 'absolute',
    alignSelf: 'center',
    top: -60, // Overlaps from the top (adjust if you want more/less overlap)
    zIndex: 10,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#ffffff',
    backgroundColor: '#e9ecef',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalHeaderText: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalProviderName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a237e',
    marginTop: 8,
  },
  modalServiceName: {
    fontSize: 18,
    color: '#495057',
    marginTop: 6,
  },
  modalBody: {
    paddingHorizontal: 8,
  },
  modalHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modalValue: {
    fontSize: 18,
    color: '#212529',
    fontWeight: '600',
    marginTop: 6,
  },
  modalPrice: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1a237e',
    marginTop: 6,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalDetailTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 24,
  },
  modalStatusBadge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  modalCloseButton: {
    backgroundColor: '#1a237e',
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default HistoryPage;