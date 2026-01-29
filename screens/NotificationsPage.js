import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchNotifications = async () => {
    const token = await AsyncStorage.getItem("authToken");
    try {
      setLoading(true);
      const response = await axios.get(
        "https://service-booking-backend-eb9i.onrender.com/api/auth/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const readStatus = await AsyncStorage.getItem("readNotifications");
      const readNotifications = readStatus ? JSON.parse(readStatus) : [];

      const updatedNotifications = response.data.notifications.map(
        (notification) => ({
          ...notification,
          read: notification.read || readNotifications.includes(notification._id),
        })
      );

      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load notifications",
        text2: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem("authToken");
            try {
              const response = await axios.delete(
                `https://service-booking-backend-eb9i.onrender.com/api/auth/notifications/${notificationId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (response.status === 200) {
                setNotifications((prev) =>
                  prev.filter((n) => n._id !== notificationId)
                );
                Toast.show({
                  type: "success",
                  text1: "Notification deleted",
                });
              }
            } catch (error) {
              console.error("Error deleting notification:", error);
              Toast.show({
                type: "error",
                text1: "Failed to delete",
                text2: "Please try again",
              });
            }
          },
        },
      ]
    );
  };

  const markAllAsRead = async () => {
    const token = await AsyncStorage.getItem("authToken");
    try {
      const unreadIds = notifications
        .filter((n) => !n.read)
        .map((n) => n._id);

      if (unreadIds.length === 0) return;

      // Mark all as read in state immediately
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true }))
      );

      // Update local storage
      await AsyncStorage.setItem(
        "readNotifications",
        JSON.stringify(notifications.map((n) => n._id))
      );

      Toast.show({
        type: "success",
        text1: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const navigateToDetail = async (notification) => {
    const token = await AsyncStorage.getItem("authToken");
    if (!notification._id) return;

    try {
      await axios.put(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/notifications/${notification._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const readStatus = await AsyncStorage.getItem("readNotifications");
      const readNotifications = readStatus ? JSON.parse(readStatus) : [];
      if (!readNotifications.includes(notification._id)) {
        readNotifications.push(notification._id);
        await AsyncStorage.setItem(
          "readNotifications",
          JSON.stringify(readNotifications)
        );
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? { ...item, read: true } : item
        )
      );

      navigation.navigate("NotificationDetail", { notification });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (item) => {
    // You can customize icons based on notification type
    if (item.read) return "notifications-none";
    return "notifications-active";
  };

  const getNotificationColor = (item) => {
    if (item.read) return "#9e9e9e";
    return "#1a237e";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes === 0 ? "Just now" : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => navigateToDetail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getNotificationColor(item)}15` },
          ]}
        >
          <Icon
            name={getNotificationIcon(item)}
            size={24}
            color={getNotificationColor(item)}
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notificationTitle,
                item.read && styles.readNotificationTitle,
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text
            style={[
              styles.notificationTime,
              item.read && styles.readNotificationTime,
            ]}
          >
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => deleteNotification(item._id)}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Icon name="delete-outline" size={22} color="#d32f2f" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonInner}>
              <Icon name="arrow-back" size={24} color="#1a237e" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIconInner}>
                <Icon name="notifications" size={32} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonInner}>
              <Icon name="arrow-back" size={24} color="#1a237e" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIconInner}>
                <Icon name="notifications" size={32} color="#1a237e" />
                {unreadCount > 0 && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up!"}
            </Text>
          </View>
        </View>

        {/* Mark All as Read Button */}
        {unreadCount > 0 && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
              activeOpacity={0.7}
            >
              <Icon name="done-all" size={18} color="#1a237e" />
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1a237e"]}
              tintColor="#1a237e"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon name="notifications-off" size={64} color="#e0e0e0" />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>
                When you receive notifications, they'll appear here
              </Text>
            </View>
          }
          contentContainerStyle={[
            styles.listContainer,
            notifications.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerIconContainer: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  headerIconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#d32f2f",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a237e",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a237e",
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadNotification: {
    backgroundColor: "#f8f9ff",
    borderColor: "#1a237e",
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    color: "#1a237e",
    fontWeight: "600",
    lineHeight: 21,
  },
  readNotificationTitle: {
    color: "#666",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1a237e",
    marginLeft: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#1a237e",
    fontWeight: "500",
    opacity: 0.7,
  },
  readNotificationTime: {
    color: "#999",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffebee",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default NotificationsPage;