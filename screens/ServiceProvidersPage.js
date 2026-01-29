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
  Platform,
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

  // RESTORED ORIGINAL SORT LOGIC
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

  const renderProvider = ({ item }) => (
    <TouchableOpacity
      style={styles.providerCard}
      activeOpacity={0.92}
      onPress={() => handleProviderClick(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: item.profileImage
                ? `https://service-booking-backend-eb9i.onrender.com/${item.profileImage.replace(/\\/g, "/")}`
                : "https://service-booking-backend-eb9i.onrender.com/uploads/default-profile.png",
            }}
            style={styles.providerImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <View style={styles.nameAndRating}>
              <Text style={styles.providerName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={14} color="#FFA000" />
                  <Text style={styles.ratingText}>
                    {item.averageRating !== "0.0" ? item.averageRating : "New"}
                  </Text>
                </View>
                <Text style={styles.reviewCount}>
                  ({item.reviewCount})
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Icon name="location-outline" size={16} color="#666" />
            <Text style={styles.providerAddress} numberOfLines={1}>
              {item.businessAddress || "Location not provided"}
            </Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description || "No description available."}
          </Text>

          <View style={styles.footerRow}>
            {item.servicePrice && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>N$ {item.servicePrice}</Text>
              </View>
            )}
            <View style={styles.arrowContainer}>
              <Icon name="chevron-forward" size={24} color="#1a237e" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#1a237e" />
      ) : (
        <>
          <Icon name="search-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No providers found</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Added padding here to stop Domestic Cleaning from cutting off */}
        <Text style={styles.title}>{serviceName} Providers</Text>
        <Text style={styles.subtitle}>Trusted professionals near you</Text>
        <Text style={styles.resultCount}>
          {sortedProviders.length} available
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.locationSearch}>
          <Icon name="location-outline" size={22} color="#666" />
          <TextInput
            style={styles.locationInput}
            placeholder="Search location..."
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
          <View style={styles.sortLabelContainer}>
            <Icon name="swap-vertical-outline" size={20} color="#1a237e" />
            <Text style={styles.sortLabel}>Sort by</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setSortOption(value)}
              items={[
                { label: "Relevance", value: "default" },
                { label: "Price: Low → High", value: "priceLow" },
                { label: "Price: High → Low", value: "priceHigh" },
                { label: "Highest Rated", value: "ratingHigh" },
              ]}
              value={sortOption}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => (
                <View style={styles.pickerIcon}>
                  <Icon name="chevron-down" size={20} color="#1a237e" />
                </View>
              )}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={sortedProviders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProvider}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a237e',
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingRight: 36,
    borderRadius: 12,
    backgroundColor: '#f0f2f8',
  },
  inputAndroid: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a237e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingRight: 36,
    borderRadius: 12,
    backgroundColor: '#f0f2f8',
  },
  placeholder: { color: '#1a237e' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: Platform.OS === 'ios' ? 50 : 70, // Pushed down further
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  resultCount: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  filtersContainer: { padding: 20 },
  locationSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 3,
    shadowOpacity: 0.1,
  },
  locationInput: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#333' },
  searchBtn: { backgroundColor: '#1a237e', padding: 10, borderRadius: 10 },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    elevation: 2,
  },
  sortLabelContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  sortLabel: { fontSize: 14, fontWeight: '700', color: '#1a237e', marginLeft: 5 },
  pickerWrapper: { flex: 1 },
  pickerIcon: { position: 'absolute', right: 10, top: 12 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  cardContent: { flexDirection: 'row', padding: 16 },
  imageWrapper: { marginRight: 16 },
  providerImage: { width: 90, height: 90, borderRadius: 15, backgroundColor: '#eee' },
  detailsContainer: { flex: 1 },
  headerRow: { marginBottom: 5 },
  providerName: { fontSize: 18, fontWeight: '700', color: '#1a237e' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff8e1', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 6 
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#FFA000', marginLeft: 3 },
  reviewCount: { fontSize: 12, color: '#999', marginLeft: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  providerAddress: { fontSize: 13, color: '#666', marginLeft: 4, flex: 1 },
  description: { fontSize: 13, color: '#777', lineHeight: 18, marginBottom: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  priceText: { fontSize: 15, fontWeight: '700', color: '#2e7d32' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#999' },
});

export default ServiceProvidersPage;