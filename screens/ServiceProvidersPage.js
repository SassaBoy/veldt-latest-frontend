import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNPickerSelect from "react-native-picker-select";

const { width } = Dimensions.get("window");

const ServiceProvidersPage = ({ route }) => {
  const { serviceName } = route.params || {};
  const navigation = useNavigation();
  const [locationQuery, setLocationQuery] = useState("");
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const initialFetch = async () => {
      const defaultLocation = await AsyncStorage.getItem("userLocation");
      fetchProviders(defaultLocation || "");
    };
    initialFetch();
  }, []);

  const fetchProviders = async (location = "") => {
    try {
      setLoading(true);
      const response = await axios.get(`https://service-booking-backend-eb9i.onrender.com/api/auth/providers`, {
        params: { serviceName, location: location || undefined },
      });

      const providers = response.data.providers || [];

      const updatedProviders = await Promise.all(
        providers.map(async (provider) => {
          try {
            const reviewRes = await axios.get(
              `https://service-booking-backend-eb9i.onrender.com/api/reviews/provider/${provider.id}/details`
            );
            const { reviewCount, averageRating } = reviewRes.data.data;
            return {
              ...provider,
              averageRating: averageRating ? averageRating.toFixed(1) : "0.0",
              reviewCount: reviewCount || 0,
            };
          } catch {
            return {
              ...provider,
              averageRating: "0.0",
              reviewCount: 0,
            };
          }
        })
      );

      setServiceProviders(updatedProviders);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setServiceProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchProviders(locationQuery.trim());
  };

  const sortedProviders = useMemo(() => {
    return [...serviceProviders].sort((a, b) => {
      const priceA = a.servicePrice ? parseFloat(a.servicePrice) : Infinity;
      const priceB = b.servicePrice ? parseFloat(b.servicePrice) : Infinity;
      const ratingA = parseFloat(a.averageRating) || 0;
      const ratingB = parseFloat(b.averageRating) || 0;

      switch (sortOption) {
        case "priceLow":
          return priceA - priceB;
        case "priceHigh":
          return priceB - priceA;
        case "ratingHigh":
          return ratingB - ratingA;
        default:
          return 0;
      }
    });
  }, [serviceProviders, sortOption]);

  const handleProviderClick = (provider) => {
    navigation.navigate("ServiceProviderProfilePage", {
      serviceName,
      name: provider.name,
      email: provider.email,
      reviewCount: provider.reviewCount,
      averageRating: provider.averageRating,
      providerId: provider.id,
    });
  };

  const getSortLabel = () => {
    const labels = {
      default: "Relevance",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      ratingHigh: "Highest Rated",
    };
    return labels[sortOption];
  };

  const renderProvider = ({ item }) => (
    <TouchableOpacity
      style={styles.providerCard}
      activeOpacity={0.92}
      onPress={() => handleProviderClick(item)}
    >
      <Image
        source={{
          uri: item.profileImage
            ? `https://service-booking-backend-eb9i.onrender.com/${item.profileImage.replace(/\\/g, "/")}`
            : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png",
        }}
        style={styles.providerImage}
        resizeMode="cover"
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerAddress}>{item.businessAddress || "Location not provided"}</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>
            ★ {item.averageRating !== "0.0" ? item.averageRating : "No rating"}
          </Text>
          <Text style={styles.reviewCount}>
            ({item.reviewCount} {item.reviewCount === 1 ? "review" : "reviews"})
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description || "No description available."}
        </Text>

        {item.servicePrice && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>N$ {item.servicePrice}</Text>
          </View>
        )}
      </View>

      <View style={styles.arrowContainer}>
        <Icon name="chevron-forward" size={28} color="#adb5bd" />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.emptyText}>
            {locationQuery ? `Searching in ${locationQuery}...` : "Finding nearby providers..."}
          </Text>
        </>
      ) : (
        <>
          <Icon name="search-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {locationQuery
              ? `No providers found in ${locationQuery}`
              : "No providers available for this service"}
          </Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your location or check back later
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{serviceName} Providers</Text>
        <Text style={styles.subtitle}>Choose from trusted professionals</Text>
        <Text style={styles.resultCount}>
          {sortedProviders.length} {sortedProviders.length === 1 ? "provider" : "providers"} found
          {locationQuery && ` in ${locationQuery}`}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.locationSearch}>
          <Icon name="location-outline" size={22} color="#666" />
          <TextInput
            style={styles.locationInput}
            placeholder="Town or city (e.g. Windhoek)"
            placeholderTextColor="#999"
            value={locationQuery}
            onChangeText={setLocationQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Icon name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sortContainer}>
          <Icon name="swap-vertical-outline" size={22} color="#1a237e" />
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={setSortOption}
              items={[
                { label: "Relevance", value: "default" },
                { label: "Price: Low → High", value: "priceLow" },
                { label: "Price: High → Low", value: "priceHigh" },
                { label: "Highest Rated", value: "ratingHigh" },
              ]}
              value={sortOption}
              style={pickerSelectStyles}
              placeholder={{}} // No placeholder - always shows selected
            
            />
          </View>
          <Text style={styles.currentSortText}>{getSortLabel()}</Text>
        </View>
      </View>

      <FlatList
        data={sortedProviders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProvider}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={15}
        windowSize={15}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    paddingRight: 30,
  },
  placeholder: {
    color: '#1a237e',
    fontWeight: '600',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#f5f7fa',
  },
  locationSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#333',
  },
  searchBtn: {
    backgroundColor: '#1a237e',
    padding: 14,
    borderRadius: 20,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sortLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  pickerWrapper: {
    flex: 1,
    marginRight: 12,
  },
  currentSortText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    minWidth: 120,
    textAlign: 'right',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  providerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 24,
  },
  providerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 8,
  },
  providerAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFA000',
    marginRight: 10,
  },
  reviewCount: {
    fontSize: 16,
    color: '#999',
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 12,
  },
  priceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  arrowContainer: {
    paddingLeft: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 19,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ServiceProvidersPage;