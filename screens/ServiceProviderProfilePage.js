import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import { TabView, SceneMap, TabBar, PagerScroll } from "react-native-tab-view";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PRIMARY_COLOR = "#1a237e";

const ServiceProviderProfilePage = ({ route, navigation }) => {
  const { name, email, serviceName, reviewCount, averageRating } = route.params || {};

  console.log("Received params:", { name, email, serviceName });

  const [provider, setProvider] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef(null);

  const ROUTES = [
    { key: 'first', title: 'Services' },
    { key: 'second', title: 'Reviews' },
    { key: 'third', title: 'Hours' },
    { key: 'fourth', title: 'Details' },
  ];

  useEffect(() => {
    fetchProviderDetails();
  }, []);

  // Auto-swipe carousel
  useEffect(() => {
    if (!provider?.images || provider.images.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % provider.images.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentImageIndex(nextIndex);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [currentImageIndex, provider?.images]);

  const fetchProviderDetails = async () => {
    try {
      if (!name || !email) {
        setLoading(false);
        Alert.alert("Error", "Missing provider information");
        return;
      }

      console.log(`Fetching provider details for name: ${name}, email: ${email}`);

      const detailsResponse = await axios.get(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/providers/details?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`
      );

      if (!detailsResponse.data?.success) {
        console.warn("No provider details found.");
        Alert.alert("Not Found", "Provider details could not be found");
        return;
      }

      const providerData = detailsResponse.data.data;
      console.log("Provider Details:", providerData);

      if (!providerData._id) {
        throw new Error("Provider ID is missing in response");
      }

      const reviewsResponse = await axios.get(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/${providerData._id}/reviews`
      );

      setProvider({
        ...providerData,
        reviews: reviewsResponse.data?.reviews || [],
        rating: reviewsResponse.data?.averageRating || "0.0",
      });

    } catch (error) {
      console.error("Error:", error.message);
      Alert.alert("Error", error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getIconUri = (platform) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return "https://cdn-icons-png.flaticon.com/512/733/733547.png";
      case "instagram":
        return "https://cdn-icons-png.flaticon.com/512/733/733558.png";
      case "twitter":
        return "https://cdn-icons-png.flaticon.com/512/733/733579.png";
      case "linkedin":
        return "https://cdn-icons-png.flaticon.com/512/733/733561.png";
      case "tiktok":
        return "https://cdn-icons-png.flaticon.com/512/3046/3046120.png";
      case "website":
        return "https://cdn-icons-png.flaticon.com/512/841/841364.png";
      default:
        return "https://cdn-icons-png.flaticon.com/512/709/709722.png";
    }
  };

  const handleSocialLinkPress = async (url) => {
    if (!url) return;

    try {
      const normalizedUrl = url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

      const supported = await Linking.canOpenURL(normalizedUrl);

      if (supported) {
        await Linking.openURL(normalizedUrl);
      } else {
        Alert.alert("Invalid URL", "Sorry, this link cannot be opened.");
      }
    } catch (error) {
      console.error("Error opening URL:", error.message);
      Alert.alert("Error", "An error occurred while trying to open the link.");
    }
  };

  const FirstRoute = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {provider?.services && provider.services.length > 0 ? (
        provider.services.map((service, index) => (
          <View key={index} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceIconCircle}>
                <Icon name="handyman" size={24} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name || "Unnamed Service"}</Text>
                <Text style={styles.servicePrice}>
                  NAD {service.price || "0"}
                </Text>
                <Text style={styles.servicePriceType}>
                  {service.priceType || "per service"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.bookServiceButton}
              onPress={() =>
                navigation.navigate("BookingPage", {
                  serviceName: service.name || "Service",
                  name,
                  email,
                  reviewCount: provider?.reviews?.length || 0,
                  averageRating: provider?.rating || "0.0",
                })
              }
              activeOpacity={0.8}
            >
              <Icon name="event" size={18} color="#fff" />
              <Text style={styles.bookServiceText}>Schedule Service</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Icon name="work-off" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No services available</Text>
        </View>
      )}
    </ScrollView>
  );

  const SecondRoute = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {provider?.reviews && Array.isArray(provider.reviews) && provider.reviews.length > 0 ? (
        provider.reviews.map((review, index) => (
          <View key={index} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image
                source={{
                  uri: review?.userId?.profileImage
                    ? `https://service-booking-backend-eb9i.onrender.com/${review.userId.profileImage.replace(/\\/g, "/")}`
                    : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png",
                }}
                style={styles.reviewerAvatar}
              />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewUser}>{review?.userId?.name || "Anonymous"}</Text>
                <Text style={styles.reviewDate}>
                  {review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown date"}
                </Text>
                <View style={styles.starsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={16}
                      color={i < (review?.rating || 0) ? "#FFA000" : "#E0E0E0"}
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>
              {typeof review?.review === 'string' ? review.review : JSON.stringify(review?.review) || "No comment"}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Icon name="rate-review" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No reviews available yet</Text>
        </View>
      )}
    </ScrollView>
  );

  const ThirdRoute = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.hoursCard}>
        {provider?.operatingHours && typeof provider.operatingHours === 'object' ?
          Object.entries(provider.operatingHours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.day}>{day}</Text>
              <View style={styles.hoursInfo}>
                {hours?.isClosed ? (
                  <View style={styles.closedBadge}>
                    <Text style={styles.closedText}>Closed</Text>
                  </View>
                ) : hours?.start && hours?.end ? (
                  <Text style={styles.hours}>{hours.start} - {hours.end}</Text>
                ) : (
                  <Text style={styles.hoursNotSet}>Not set</Text>
                )}
              </View>
            </View>
          )) :
          <View style={styles.emptyState}>
            <Icon name="schedule" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Operating hours not available</Text>
          </View>
        }
      </View>
    </ScrollView>
  );

  const DetailsRoute = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.detailsCard}>
        <View style={styles.detailSection}>
          <Icon name="business" size={20} color={PRIMARY_COLOR} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Business Name</Text>
            <Text style={styles.detailText}>{provider?.businessName || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Icon name="location-city" size={20} color={PRIMARY_COLOR} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Town/City</Text>
            <Text style={styles.detailText}>{provider?.town || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Icon name="description" size={20} color={PRIMARY_COLOR} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>About</Text>
            <Text style={styles.detailText}>{provider?.description || "No description available."}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Icon name="work-history" size={20} color={PRIMARY_COLOR} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Experience</Text>
            <Text style={styles.detailText}>
              {provider?.yearsOfExperience ? `${provider.yearsOfExperience} years` : "Not specified"}
            </Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Icon name="location-on" size={20} color={PRIMARY_COLOR} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailText}>{provider?.address || provider?.businessAddress || "No address provided"}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Icon name="phone" size={20} color={PRIMARY_COLOR} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Phone</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.detailText}>{provider?.phone || "No phone provided"}</Text>
              {provider?.phone && (
                <TouchableOpacity
                  style={styles.callButtonSmall}
                  onPress={() => Linking.openURL(`tel:${provider.phone}`)}
                  activeOpacity={0.7}
                >
                  <Icon name="phone" size={16} color="#fff" />
                  <Text style={styles.callButtonSmallText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {provider?.socialLinks && Object.values(provider.socialLinks).some(link => link) && (
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Connect</Text>
            <View style={styles.socialLinksContainer}>
              {Object.entries(provider.socialLinks).map(([platform, url], index) =>
                url ? (
                  <TouchableOpacity
                    key={index}
                    style={styles.socialIcon}
                    onPress={() => handleSocialLinkPress(url)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: getIconUri(platform) }}
                      style={styles.socialIconImage}
                    />
                  </TouchableOpacity>
                ) : null
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading provider details...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={80} color="#ccc" />
        <Text style={styles.errorText}>
          Could not load provider information
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchProviderDetails();
          }}
          activeOpacity={0.8}
        >
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* Image Carousel */}
      <View style={styles.header}>
        {provider?.images && provider.images.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={provider.images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Image
                  source={{
                    uri: typeof item === 'string' && item ? (
                      item.startsWith("http")
                        ? item
                        : `https://service-booking-backend-eb9i.onrender.com/${item}`
                    ) : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png"
                  }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              )}
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentImageIndex(index);
              }}
              onScrollToIndexFailed={() => {}}
              snapToInterval={SCREEN_WIDTH}
              decelerationRate="fast"
              scrollEventThrottle={16}
            />
            {provider.images.length > 1 && (
              <View style={styles.paginationDots}>
                {provider.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentImageIndex === index && styles.activeDot
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <Image
            source={require('../assets/default-profile.png')}
            style={styles.carouselImage}
            resizeMode="cover"
          />
        )}
        
        {/* Rating Badge - Positioned lower for iOS */}
        <View style={styles.ratingContainer}>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={20} color="#FFA000" />
            <Text style={styles.rating}>{provider?.rating || "0.0"}</Text>
          </View>
          <Text style={styles.reviewCount}>
            {provider?.reviews?.length || 0} {provider?.reviews?.length === 1 ? "review" : "reviews"}
          </Text>
        </View>
      </View>

      {/* Business Info */}
      <View style={styles.businessInfo}>
        <View style={styles.titleRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.businessName} numberOfLines={1}>
              {provider?.name || "Service Provider"}
            </Text>
            {provider?.verified && (
              <Icon name="verified" size={24} color="#1a73e8" style={styles.verifiedIcon} />
            )}
          </View>

          {provider?.phone && (
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => Linking.openURL(`tel:${provider.phone}`)}
              activeOpacity={0.7}
            >
              <Icon name="phone" size={18} color="#fff" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.addressRow}>
          <Icon name="business" size={16} color="#666" />
          <Text style={styles.address}>{provider?.businessName || "Business name not available"}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabBar}>
          {ROUTES.map((route, idx) => (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.tab,
                tabIndex === idx && styles.activeTab
              ]}
              onPress={() => setTabIndex(idx)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.tabText,
                tabIndex === idx && styles.activeTabText
              ]}>
                {route.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentContainer}>
          {tabIndex === 0 && <FirstRoute />}
          {tabIndex === 1 && <SecondRoute />}
          {tabIndex === 2 && <ThirdRoute />}
          {tabIndex === 3 && <DetailsRoute />}
        </View>
      </View>

      {/* Book Button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate("BookingPage", {
            serviceName: serviceName || (provider?.services?.[0]?.name || "Service"),
            name,
            email,
            reviewCount: provider?.reviews?.length || 0,
            averageRating: provider?.rating || "0.0",
          })
        }
        activeOpacity={0.8}
      >
        <Icon name="event-available" size={22} color="#fff" />
        <Text style={styles.bookButtonText}>Schedule Appointment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    position: 'relative',
    height: 300,
    backgroundColor: PRIMARY_COLOR,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  ratingContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 16,
    alignItems: 'flex-end',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  rating: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  reviewCount: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  businessInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    letterSpacing: -0.5,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: 2,
  },
  servicePriceType: {
    fontSize: 12,
    color: '#999',
  },
  bookServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  bookServiceText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 12,
  },
  hoursCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  day: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  hoursInfo: {
    alignItems: 'flex-end',
  },
  hours: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  closedBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d32f2f',
  },
  hoursNotSet: {
    fontSize: 13,
    color: '#ccc',
    fontStyle: 'italic',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  detailSection: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  callButtonSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  socialSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialIconImage: {
    width: 24,
    height: 24,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    margin: 16,
    paddingVertical: 18,
    borderRadius: 14,
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
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fc',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ServiceProviderProfilePage;

