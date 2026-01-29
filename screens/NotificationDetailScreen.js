import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Share,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

const NotificationDetailScreen = ({ route }) => {
  const { notification } = route.params;
  const navigation = useNavigation();

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleShare = async () => {
    try {
      const messageDetails = formatNotificationMessage(notification.message);
      const shareMessage = [
        notification.title,
        "",
        ...messageDetails.map((item) => `${item.label}: ${item.value}`),
      ].join("\n");

      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error("Error sharing notification:", error);
      Toast.show({
        type: "error",
        text1: "Share failed",
        text2: "Unable to share notification",
      });
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return formatDate(date);
  };

  const formatNotificationMessage = (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      return [
        {
          label: "Service",
          value: parsedMessage.serviceName,
          icon: "room-service",
        },
        {
          label: "Date",
          value: new Date(parsedMessage.date).toLocaleDateString(),
          icon: "event",
        },
        {
          label: "Time",
          value: new Date(parsedMessage.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          icon: "access-time",
        },
        {
          label: "Price",
          value: `N$${parsedMessage.price}`,
          icon: "attach-money",
        },
        {
          label: "Client Name",
          value: parsedMessage.clientName,
          icon: "person",
        },
        {
          label: "Client Email",
          value: parsedMessage.clientEmail,
          icon: "email",
        },
        {
          label: "Client Phone",
          value: parsedMessage.clientPhone,
          icon: "phone",
        },
        {
          label: "Address",
          value: parsedMessage.address,
          icon: "location-on",
        },
      ].filter((item) => item.value); // Filter out empty values
    } catch (error) {
      return [{ label: "Message", value: message, icon: "message" }];
    }
  };

  const messageDetails = formatNotificationMessage(notification.message);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast />
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fc" />
      
      {/* Header */}
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
        <Text style={styles.headerTitle}>Notification Details</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
          activeOpacity={0.7}
        >
          <View style={styles.shareButtonInner}>
            <Icon name="share" size={20} color="#1a237e" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <View style={styles.heroIconInner}>
              <Icon name="notifications-active" size={40} color="#1a237e" />
            </View>
          </View>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <View style={styles.timeContainer}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.timeText}>{getRelativeTime(notification.createdAt)}</Text>
          </View>
          <View style={styles.fullDateContainer}>
            <Text style={styles.fullDateText}>{formatDate(notification.createdAt)}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Icon name="info" size={20} color="#1a237e" />
            <Text style={styles.detailsHeaderText}>Details</Text>
          </View>

          <View style={styles.detailsContent}>
            {messageDetails.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.detailRow,
                  index === messageDetails.length - 1 && styles.lastDetailRow,
                ]}
              >
                <View style={styles.detailIconWrapper}>
                  <Icon name={item.icon} size={20} color="#1a237e" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Icon name="share" size={20} color="#1a237e" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Feature coming soon",
              });
            }}
            activeOpacity={0.7}
          >
            <Icon name="bookmark-outline" size={20} color="#1a237e" />
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <View style={styles.infoIconWrapper}>
            <Icon name="info-outline" size={18} color="#1976d2" />
          </View>
          <Text style={styles.infoText}>
            This notification was sent to inform you about important updates. You can
            share or save it for future reference.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  backButton: {
    marginRight: 12,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1a237e",
    textAlign: "center",
  },
  shareButton: {
    marginLeft: 12,
  },
  shareButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroSection: {
    backgroundColor: "#fff",
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 16,
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
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#f0f0f0",
    ...Platform.select({
      ios: {
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a237e",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.3,
    paddingHorizontal: 16,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#1a237e",
    fontWeight: "600",
  },
  fullDateContainer: {
    marginTop: 4,
  },
  fullDateText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#f0f0f0",
    gap: 8,
  },
  detailsHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a237e",
  },
  detailsContent: {
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#1a237e",
    fontWeight: "600",
    lineHeight: 22,
  },
  actionsSection: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
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
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a237e",
  },
  infoFooter: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1976d2",
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1976d2",
    lineHeight: 19,
  },
});

export default NotificationDetailScreen;