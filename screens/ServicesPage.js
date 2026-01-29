import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#1a237e';

const ServicesPage = ({ route }) => {
  const { categoryName, services } = route.params;
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState(services);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  useEffect(() => {
    setFilteredServices(services);
  }, [services]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredServices(services);
      return;
    }

    const sortedServices = [...services].sort((a, b) => {
      const aMatches = a.name.toLowerCase().includes(query.toLowerCase());
      const bMatches = b.name.toLowerCase().includes(query.toLowerCase());
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

    const filtered = sortedServices.filter((service) =>
      service.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredServices(filtered);
  };

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredServices(services);
  };

  const serviceCount = useMemo(() => filteredServices.length, [filteredServices]);

  const renderItem = ({ item }) => {
    const isExpanded = expandedDescriptions[item._id];

    return (
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => navigation.navigate('LoadingScreen', { service: item })}
        activeOpacity={0.8}
      >
        <View style={styles.serviceContent}>
          <View style={styles.serviceIconCircle}>
            <Icon name="cleaning-services" size={28} color={PRIMARY_COLOR} />
          </View>
          
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>{item.name}</Text>
            
            {item.description && (
              <>
                <Text 
                  style={styles.serviceDescription}
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {item.description}
                </Text>
                {item.description.length > 80 && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleDescription(item._id);
                    }}
                    style={styles.readMoreButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.readMoreText}>
                      {isExpanded ? 'Show less' : 'Read more'}
                    </Text>
                    <Icon 
                      name={isExpanded ? "expand-less" : "expand-more"} 
                      size={16} 
                      color={PRIMARY_COLOR} 
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          <View style={styles.arrowContainer}>
            <Icon name="chevron-forward" size={28} color={PRIMARY_COLOR} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    if (searchQuery.trim() !== '') {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Icon name="search-off" size={60} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>No services found</Text>
          <Text style={styles.emptyText}>
            No services match "{searchQuery}"
          </Text>
          <TouchableOpacity 
            style={styles.clearSearchButton}
            onPress={clearSearch}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.clearSearchText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconCircle}>
          <Icon name="work-off" size={60} color="#ccc" />
        </View>
        <Text style={styles.emptyTitle}>No Services</Text>
        <Text style={styles.emptyText}>
          No services available in this category yet
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.resultCountContainer}>
        <Icon name="list" size={20} color={PRIMARY_COLOR} />
        <Text style={styles.resultCount}>
          {serviceCount} {serviceCount === 1 ? 'service' : 'services'} available
        </Text>
      </View>
      {searchQuery.trim() !== '' && (
        <View style={styles.searchResultBadge}>
          <Text style={styles.searchResultText}>
            Showing results for "{searchQuery}"
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{categoryName}</Text>
            <Text style={styles.headerSubtitle}>Select a service to continue</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Icon name="search" size={22} color={PRIMARY_COLOR} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.trim() !== '' && (
            <TouchableOpacity 
              onPress={clearSearch}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        ListHeaderComponent={serviceCount > 0 ? renderHeader : null}
        contentContainerStyle={[
          styles.listContainer,
          filteredServices.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  searchSection: {
    padding: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
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
        elevation: 3,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  listHeader: {
    marginBottom: 16,
  },
  resultCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  searchResultBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchResultText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
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
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  serviceIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  serviceDetails: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 6,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  readMoreText: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  clearSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  clearSearchText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ServicesPage;