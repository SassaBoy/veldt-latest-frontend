import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const PRIMARY_COLOR = '#1a237e';

const IndividualCleaningScreen = ({ navigation, route }) => {
  const {
    name,
    email,
    serviceName,
    selectedFrequency: savedFrequency,
    selectedService: savedService,
    date: savedDate,
    time: savedTime,
    address: savedAddress,
  } = route.params || {};

  const [serviceDetails, setServiceDetails] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [selectedFrequency, setSelectedFrequency] = useState(savedFrequency || 'Every Week');
  const [selectedService, setSelectedService] = useState(
    savedService !== undefined ? savedService : null
  );
  const [date, setDate] = useState(savedDate ? new Date(savedDate) : null);
  const [time, setTime] = useState(savedTime ? new Date(savedTime) : null);
  const [address, setAddress] = useState(savedAddress || '');
  const [imageError, setImageError] = useState(false);

  // Animation states
  const [showSuccess, setShowSuccess] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkRotate = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0)).current;
  const ringScale2 = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchServiceDetails();
  }, []);

  const fetchServiceDetails = async () => {
    setFetchingDetails(true);
    try {
      const response = await axios.get(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/provider-service`,
        {
          params: { name, email, serviceName },
        }
      );

      if (response.data.success) {
        setServiceDetails(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch service details.');
      }
    } catch (error) {
      console.error('Error fetching service details:', error.message);
      Alert.alert('Error', 'Could not load service details. Please try again.');
    } finally {
      setFetchingDetails(false);
    }
  };

  const triggerEpicSuccessAnimation = () => {
    setShowSuccess(true);

    Animated.parallel([
      // Overlay fade-in (dramatic dark)
      Animated.timing(overlayOpacity, {
        toValue: 0.92,
        duration: 350,
        useNativeDriver: true,
      }),
      // Quick white flash
      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.7,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      // Checkmark explode + spin
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1.15,
          friction: 3.5,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(checkRotate, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
      ]),
      // Two shockwave rings
      Animated.sequence([
        Animated.timing(ringScale1, {
          toValue: 2.8,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(ringScale2, {
          toValue: 3.6,
          duration: 900,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      // Sparkle burst
      Animated.timing(sparkleOpacity, {
        toValue: 1,
        duration: 400,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after animation
    setTimeout(() => {
      setShowSuccess(false);
      navigation.navigate("ThankYou", {
        date: date.toISOString(),
        time: time.toISOString(),
        selectedService: calculateOptions()[selectedService]?.name,
        price: calculateOptions()[selectedService]?.price,
        providerDetails: serviceDetails,
      });
    }, 2000);
  };

  const handleBookService = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("Login Required", "You need to log in to book a service.");
        navigation.navigate("Login", {
          role: "Client",
          redirectTo: "BookingPage",
          params: {
            ...route.params,
            selectedFrequency,
            selectedService,
            date: date?.toISOString(),
            time: time?.toISOString(),
            address,
          },
        });
        return;
      }

      let userId;
      try {
        const response = await fetch("https://service-booking-backend-eb9i.onrender.com/api/auth/user-details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          Alert.alert("Session Expired", "Please log in again.");
          await AsyncStorage.removeItem("authToken");
          navigation.navigate("Login");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            userId = data.user.id;
          } else {
            throw new Error(data.message || "Failed to fetch user details.");
          }
        } else {
          throw new Error("Failed to fetch user details.");
        }
      } catch (fetchError) {
        console.error("Error fetching user details:", fetchError);
        Alert.alert("Error", "Unable to verify your account. Please log in again.");
        navigation.navigate("Login");
        return;
      }

      if (!userId) {
        Alert.alert("Error", "User information is missing. Please log in again.");
        navigation.navigate("Login");
        return;
      }

      if (!date || !time || selectedService === null) {
        Alert.alert("Incomplete Details", "Please select service, date, and time.");
        return;
      }

      const selectedOption = calculateOptions()[selectedService];

      if (!serviceDetails?.providerId) {
        Alert.alert("Error", "Service provider information is missing.");
        return;
      }

      const bookingData = {
        userId,
        serviceName: selectedOption.name,
        date: date.toISOString(),
        time: time.toISOString(),
        price: selectedOption.price,
        providerId: serviceDetails.providerId,
        address,
      };

      const response = await axios.post(
        "https://service-booking-backend-eb9i.onrender.com/api/book/book-service",
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Launch the epic celebration
        triggerEpicSuccessAnimation();
      } else {
        Alert.alert("Booking Failed", response.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to process booking. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFrequencyChange = (frequency) => {
    setSelectedFrequency(frequency);
    setSelectedService(null);
  };

  const handleServiceSelect = (index) => {
    setSelectedService(index);
  };

  const handleDateConfirm = (selectedDate) => {
    setDate(selectedDate);
    setDatePickerVisibility(false);
  };

  const handleTimeConfirm = (selectedTime) => {
    setTime(selectedTime);
    setTimePickerVisibility(false);
  };

  const calculateOptions = () => {
    if (!serviceDetails) return [];
    const { price, priceType } = serviceDetails;
    const options = [];

    if (priceType === 'hourly') {
      if (selectedFrequency === 'One Time') {
        options.push({
          name: `${serviceName} - One Time (Hourly Rate)`,
          price,
        });
      } else {
        options.push(
          { name: `1 Hour of ${serviceName} ${selectedFrequency.toLowerCase()}`, price },
          { name: `2 Hours of ${serviceName} ${selectedFrequency.toLowerCase()}`, price: price * 2 },
          { name: `3 Hours of ${serviceName} ${selectedFrequency.toLowerCase()}`, price: price * 3 },
          { name: `5 Hours of ${serviceName} ${selectedFrequency.toLowerCase()}`, price: price * 5 }
        );
      }
    } else {
      options.push({
        name: `${serviceName} ${selectedFrequency.toLowerCase()}`,
        price,
      });
    }

    return options;
  };

  const serviceOptions = useMemo(() => calculateOptions(), [serviceDetails, selectedFrequency, serviceName]);

  const isFormValid = useMemo(() => {
    return date && time && selectedService !== null && address.trim() !== '';
  }, [date, time, selectedService, address]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Image */}
        <View style={styles.header}>
          {fetchingDetails ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
          ) : (
            <Image
              source={{
                uri: serviceDetails?.imageUrl || 'https://via.placeholder.com/400x250?text=Service',
              }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {fetchingDetails ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
              <Text style={styles.loadingText}>Loading service details...</Text>
            </View>
          ) : (
            <>
              {/* Service Info Card */}
              <View style={styles.serviceInfoCard}>
                <Text style={styles.title}>{serviceName}</Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingBadge}>
                    <Icon name="star" size={20} color="#FFA000" />
                    <Text style={styles.rating}>{route.params?.averageRating || "0.0"}</Text>
                  </View>
                  <Text style={styles.reviewCount}>
                    {route.params?.reviewCount || 0} {route.params?.reviewCount === 1 ? "review" : "reviews"}
                  </Text>
                </View>
              </View>

              {/* Frequency Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="repeat" size={22} color={PRIMARY_COLOR} />
                  <Text style={styles.sectionTitle}>Service Frequency</Text>
                </View>
                <View style={styles.frequencyContainer}>
                  {['Every Week', 'Bi-Weekly', 'One Time'].map((frequency) => (
                    <TouchableOpacity
                      key={frequency}
                      style={[
                        styles.frequencyButton,
                        selectedFrequency === frequency && styles.frequencyButtonSelected,
                      ]}
                      onPress={() => handleFrequencyChange(frequency)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          selectedFrequency === frequency && styles.frequencyButtonTextSelected,
                        ]}
                      >
                        {frequency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Service Options */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="cleaning-services" size={22} color={PRIMARY_COLOR} />
                  <Text style={styles.sectionTitle}>Service Options</Text>
                </View>
                <View style={styles.serviceContainer}>
                  {serviceOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.serviceOption,
                        selectedService === index && styles.serviceOptionSelected,
                      ]}
                      onPress={() => handleServiceSelect(index)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.serviceOptionContent}>
                        <View style={styles.serviceOptionIcon}>
                          <Icon
                            name={selectedService === index ? "check-circle" : "radio-button-unchecked"}
                            size={24}
                            color={selectedService === index ? "#fff" : PRIMARY_COLOR}
                          />
                        </View>
                        <View style={styles.serviceOptionDetails}>
                          <Text
                            style={[
                              styles.serviceOptionName,
                              selectedService === index && styles.serviceOptionNameSelected,
                            ]}
                          >
                            {option.name}
                          </Text>
                          <Text
                            style={[
                              styles.serviceOptionPrice,
                              selectedService === index && styles.serviceOptionPriceSelected,
                            ]}
                          >
                            NAD {option.price}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date & Time Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="schedule" size={22} color={PRIMARY_COLOR} />
                  <Text style={styles.sectionTitle}>Schedule</Text>
                </View>
                <View style={styles.dateTimeContainer}>
                  <TouchableOpacity
                    onPress={() => setDatePickerVisibility(true)}
                    style={styles.dateTimeButton}
                    activeOpacity={0.8}
                  >
                    <Icon name="calendar-today" size={22} color={PRIMARY_COLOR} />
                    <View style={styles.dateTimeContent}>
                      <Text style={styles.dateTimeLabel}>Date</Text>
                      <Text style={styles.dateTimeValue}>
                        {date ? date.toLocaleDateString() : 'Select Date'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setTimePickerVisibility(true)}
                    style={styles.dateTimeButton}
                    activeOpacity={0.8}
                  >
                    <Icon name="access-time" size={22} color={PRIMARY_COLOR} />
                    <View style={styles.dateTimeContent}>
                      <Text style={styles.dateTimeLabel}>Time</Text>
                      <Text style={styles.dateTimeValue}>
                        {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Time'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Address Input */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="location-on" size={22} color={PRIMARY_COLOR} />
                  <Text style={styles.sectionTitle}>Service Location</Text>
                </View>
                <View style={styles.addressContainer}>
                  <Icon name="home" size={20} color={PRIMARY_COLOR} style={styles.addressIcon} />
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Enter your full address"
                    placeholderTextColor="#999"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* Booking Summary */}
              {isFormValid && (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Icon name="receipt" size={22} color={PRIMARY_COLOR} />
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service:</Text>
                    <Text style={styles.summaryValue}>{serviceOptions[selectedService]?.name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date:</Text>
                    <Text style={styles.summaryValue}>{date?.toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Time:</Text>
                    <Text style={styles.summaryValue}>
                      {time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryTotalRow}>
                    <Text style={styles.summaryTotalLabel}>Total Price:</Text>
                    <Text style={styles.summaryTotalValue}>NAD {serviceOptions[selectedService]?.price}</Text>
                  </View>
                </View>
              )}

              {/* Book Button */}
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  !isFormValid && styles.bookButtonDisabled,
                ]}
                onPress={handleBookService}
                disabled={loading || !isFormValid}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Icon name="event-available" size={22} color="#fff" />
                    <Text style={styles.bookButtonText}>Confirm Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Date/Time Pickers */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
          minimumDate={new Date()}
        />
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => setTimePickerVisibility(false)}
        />
      </ScrollView>

      {/* === Premium Celebration Animation Overlay === */}
      {showSuccess && (
        <Animated.View style={StyleSheet.absoluteFill}>
          {/* Dark cinematic overlay */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#1a237e', opacity: overlayOpacity },
            ]}
          />

          {/* Bright victory flash */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#ffffff', opacity: flashOpacity },
            ]}
          />

          {/* Outer shockwave ring */}
          <Animated.View
            style={[
              styles.ringOuter,
              { transform: [{ scale: ringScale1 }] },
            ]}
          />

          {/* Inner glowing ring */}
          <Animated.View
            style={[
              styles.ringInner,
              { transform: [{ scale: ringScale2 }] },
            ]}
          />

          {/* Massive glowing checkmark with spin */}
          <Animated.View
            style={[
              styles.checkContainer,
              {
                transform: [
                  { scale: checkScale },
                  {
                    rotate: checkRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="check-circle" size={200} color="#fff" />
          </Animated.View>

          {/* Sparkle burst (small animated dots) */}
          <Animated.View style={[styles.sparkles, { opacity: sparkleOpacity }]}>
            {[...Array(16)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.sparkle,
                  {
                    transform: [
                      {
                        translateX: Math.sin(i * 22.5) * 140,
                      },
                      {
                        translateY: Math.cos(i * 22.5) * 140,
                      },
                    ],
                  },
                ]}
              />
            ))}
          </Animated.View>
        </Animated.View>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>Processing your booking...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    height: 250,
    backgroundColor: PRIMARY_COLOR,
    position: 'relative',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#f8f9fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  serviceInfoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 160, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFA000',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    letterSpacing: -0.3,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  frequencyButtonSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  frequencyButtonTextSelected: {
    color: '#fff',
  },
  serviceContainer: {
    gap: 12,
  },
  serviceOption: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  serviceOptionSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  serviceOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceOptionIcon: {
    marginRight: 14,
  },
  serviceOptionDetails: {
    flex: 1,
  },
  serviceOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceOptionNameSelected: {
    color: '#fff',
  },
  serviceOptionPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4CAF50',
  },
  serviceOptionPriceSelected: {
    color: '#fff',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateTimeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  addressContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  summaryTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4CAF50',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 20,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bookButtonDisabled: {
    backgroundColor: '#bdbdbd',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 35, 126, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // ── Epic Celebration Animation Styles ────────────────────────────────────────
  ringOuter: {
    width: 600,
    height: 600,
    borderRadius: 300,
    borderWidth: 10,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    position: 'absolute',
  },
  ringInner: {
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 12,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    position: 'absolute',
  },
  checkContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 25,
  },
  sparkles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    opacity: 0.9,
  },
});

export default IndividualCleaningScreen;