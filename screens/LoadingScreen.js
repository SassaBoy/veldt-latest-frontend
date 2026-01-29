import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import * as Progress from 'react-native-progress';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const PRIMARY_COLOR = '#1a237e';
const SECONDARY_COLOR = '#F8F9FF';
const TEXT_COLOR = '#333333';

const LoadingScreen = ({ navigation, route }) => {
  const { service } = route.params || {};

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => null,
      headerShown: false, 
    });

    if (!service || !service.name) {
      console.error('Missing or invalid service parameter');
      return;
    }

    const timer = setTimeout(() => {
      navigation.replace('ServiceProvidersPage', { serviceName: service.name, service });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, service]);

  if (!service || !service.name) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={64} color="#E53935" />
        <Text style={styles.errorText}>
          Something went wrong. Missing service information.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Decorative background element for a cleaner feel */}
      <View style={styles.backgroundCircle} />

      <Animated.View entering={FadeInUp.duration(800)} style={styles.iconContainer}>
        <View style={styles.searchCircle}>
          <MaterialIcons name="search" size={50} color="#FFF" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.textSection}>
        <Text style={styles.title}>
          Finding your Professional
        </Text>
        <Text style={styles.subtitle}>
          Connecting you with the best <Text style={styles.boldText}>{service.name}</Text> services in your area...
        </Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        <Progress.Bar
          indeterminate={true}
          width={width * 0.7}
          height={6}
          color={PRIMARY_COLOR}
          unfilledColor="rgba(26, 35, 126, 0.1)"
          borderWidth={0}
          borderRadius={12}
          animationType="timing"
        />
        <Text style={styles.statusText}>Searching for matches...</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(800).duration(1000)} style={styles.footer}>
        <ActivityIndicator size="small" color={PRIMARY_COLOR} style={{ marginBottom: 10 }} />
        <Text style={styles.tipText}>
          Quality takes a moment
        </Text>
      </Animated.View>
    </View>
  );
};

const { width, height } = require('react-native').Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 40,
  },
  backgroundCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: 'rgba(26, 35, 126, 0.03)',
    top: -width * 0.8,
  },
  iconContainer: {
    marginBottom: 40,
  },
  searchCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  boldText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  statusText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    opacity: 0.6,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  tipText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 18,
    color: '#E53935',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
  },
});

export default LoadingScreen;