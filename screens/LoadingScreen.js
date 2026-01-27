import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Progress from 'react-native-progress';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const PRIMARY_COLOR = '#1a237e';
const SECONDARY_COLOR = '#F8F9FF';
const TEXT_COLOR = '#333333';
const ACCENT_COLOR = '#4CAF50';

const LoadingScreen = ({ navigation, route }) => {
  const { service } = route.params || {};

  useEffect(() => {
    // Disable swipe back gesture and hide back button
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => null,
      headerShown: false, // Hide header entirely for full-screen loading feel
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
      <Animated.View entering={FadeInUp.duration(800)}>
        <MaterialIcons name="search" size={80} color={PRIMARY_COLOR} style={styles.icon} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(800)}>
        <Text style={styles.title}>
          Finding the best providers...
        </Text>
        <Text style={styles.subtitle}>
          Searching for top-rated {service.name} services near you
        </Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Progress.Bar
          indeterminate={true}
          width={280}
          height={8}
          color={PRIMARY_COLOR}
          unfilledColor="#e0e0e0"
          borderWidth={0}
          borderRadius={12}
          style={styles.progressBar}
          animationType="timing"
        />
      </View>

      <Animated.View entering={FadeInDown.delay(800).duration(1000)}>
        <Text style={styles.tipText}>
          This usually takes just a few seconds
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 32,
    opacity: 0.9,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: TEXT_COLOR,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  progressBar: {
    marginTop: 24,
  },
  tipText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  errorText: {
    fontSize: 18,
    color: '#E53935',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
    lineHeight: 26,
  },
});

export default LoadingScreen;