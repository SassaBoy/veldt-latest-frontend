import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const ReviewsPage = ({ navigation }) => {
  const [reviewsData, setReviewsData] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Session expired. Please log in again.");
        navigation.navigate("Login");
        return;
      }

      const response = await axios.get(
        "https://service-booking-backend-eb9i.onrender.com/api/reviews/my-reviews",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReviewsData(response.data.data.reviews || []);
        setAverageRating(response.data.data.averageRating || 0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      Alert.alert("Error", "Could not load reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => {
      let iconName = "star-outline";
      if (i < Math.floor(rating)) iconName = "star";
      else if (i === Math.floor(rating) && rating % 1 !== 0) iconName = "star-half";
      return <Icon key={i} name={iconName} size={16} color="#FFD700" />;
    });
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{
            uri: item.userId?.profileImage
              ? `https://service-booking-backend-eb9i.onrender.com/${item.userId.profileImage.replace(/\\/g, "/")}`
              : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png",
          }}
          style={styles.avatar}
        />
        <View style={styles.reviewerDetails}>
          <Text style={styles.reviewerName}>{item.userId?.name || "Verified Customer"}</Text>
          <View style={styles.starsRow}>
            {renderStars(item.rating)}
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackText}>{item.review}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1a237e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Reviews</Text>
        <TouchableOpacity onPress={fetchReviews} style={styles.refreshButton}>
          <Icon name="refresh" size={22} color="#1a237e" />
        </TouchableOpacity>
      </View>

      {/* Summary Score */}
      {!loading && reviewsData.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.scoreContainer}>
            <Text style={styles.bigScore}>{averageRating}</Text>
            <View style={styles.bigStars}>{renderStars(averageRating)}</View>
            <Text style={styles.totalReviews}>{reviewsData.length} total reviews</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading feedback...</Text>
        </View>
      ) : (
        <FlatList
          data={reviewsData}
          keyExtractor={(item) => item._id}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="rate-review" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No reviews found yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0f2f5", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800", color: "#1a237e" },
  refreshButton: { width: 40, alignItems: "flex-end" },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  bigScore: { fontSize: 48, fontWeight: "900", color: "#1a237e" },
  bigStars: { flexDirection: "row", marginVertical: 8 },
  totalReviews: { fontSize: 12, color: "#888", fontWeight: "600", textTransform: "uppercase" },
  listContainer: { padding: 20, paddingTop: 0 },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12, backgroundColor: "#eee" },
  reviewerDetails: { flex: 1 },
  reviewerName: { fontSize: 15, fontWeight: "700", color: "#333", marginBottom: 2 },
  starsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateText: { fontSize: 11, color: "#aaa", fontWeight: "500" },
  feedbackContainer: { backgroundColor: "#f9f9fb", padding: 12, borderRadius: 12 },
  feedbackText: { fontSize: 14, color: "#555", lineHeight: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#1a237e", fontWeight: "500" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, color: "#aaa", fontSize: 16 },
});

export default ReviewsPage;333