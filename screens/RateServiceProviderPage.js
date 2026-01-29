import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  StatusBar,
  Platform,
  ScrollView, // Imported ScrollView
  KeyboardAvoidingView, // Added for better input handling
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const RateServiceProviderPage = ({ navigation, route }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const {
    providerName = "Service Provider",
    avatar = "https://via.placeholder.com/150",
    serviceName = "Service Name",
    bookingId,
    totalPrice = "N/A",
  } = route.params || {};

  if (!bookingId) {
    navigation.navigate("Home");
    return null;
  }

  const handleRatingPress = (value) => setRating(value);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }
    if (!feedback.trim()) {
      Alert.alert("Feedback Required", "Please let us know how the service was.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }

      const response = await axios.post(
        "https://service-booking-backend-eb9i.onrender.com/api/reviews/submit",
        { bookingId, rating, review: feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        Alert.alert("Error", response.data.message || "Failed to submit review.");
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Connection error.");
    }
  };

  const handleNotNow = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.navigate("Login");
        return;
      }
      const response = await axios.post(
        `https://service-booking-backend-eb9i.onrender.com/api/reviews/skip`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigation.navigate("Home");
      }
    } catch (error) {
      navigation.navigate("Home");
    }
  };

  const renderStars = (currentRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => handleRatingPress(i)} activeOpacity={0.7}>
          <Icon
            name={i <= currentRating ? "star" : "star-outline"}
            size={42}
            color={i <= currentRating ? "#FFA000" : "#CBD5E0"}
            style={styles.starIcon}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-ios" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Experience</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Provider Profile Card */}
          <View style={styles.profileSection}>
            <Image
              source={{
                uri: avatar && avatar.startsWith("http")
                  ? avatar
                  : `https://service-booking-backend-eb9i.onrender.com/${avatar.replace(/\\/g, "/") || "uploads/default-profile.png"}`,
              }}
              style={styles.avatar}
            />
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{providerName}</Text>
              <Text style={styles.serviceText}>{serviceName}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>Paid: NAD {totalPrice}</Text>
              </View>
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.inputArea}>
            <Text style={styles.sectionTitle}>How was your service?</Text>
            <View style={styles.starsContainer}>{renderStars(rating)}</View>

            <Text style={styles.sectionTitle}>Detailed Feedback</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Share your thoughts about the service provider..."
              placeholderTextColor="#A0AEC0"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.notNowButton} onPress={handleNotNow}>
              <Text style={styles.notNowButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },
  header: {
    backgroundColor: "#1a237e",
    paddingTop: Platform.OS === 'ios' ? 20 : 60, 
    paddingBottom: 40, // Increased to account for the card overlap
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40, // Space at the bottom so buttons aren't flush with the edge
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    marginTop: -25, // Overlap the header
    elevation: 8,
    shadowColor: "#1a237e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a237e",
  },
  serviceText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: "#E8F5E9",
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E7D32",
  },
  inputArea: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: 'center',
    marginBottom: 30,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  feedbackInput: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    height: 150, // Increased height for better typing experience
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 25,
    color: '#2D3748',
  },
  submitButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
  },
  notNowButton: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
  },
  notNowButtonText: {
    fontSize: 16,
    color: "#718096",
    fontWeight: "600",
  },
});

export default RateServiceProviderPage;