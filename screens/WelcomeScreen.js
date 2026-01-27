import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  BackHandler
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Professional color palette
const COLORS = {
  primary: '#2563EB', // Blue
  primaryDark: '#1E40AF',
  secondary: '#7C3AED', // Purple
  background: '#0A0E27',
  surface: '#151B3D',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  accent: '#10B981', // Green
};

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  
  const clientButtonScale = useRef(new Animated.Value(1)).current;
  const providerButtonScale = useRef(new Animated.Value(1)).current;

  const [isNavigating, setIsNavigating] = useState(false);
  
  const animationRefs = useRef({
    floatLoop1: null,
    floatLoop2: null,
  }).current;

  const startFloatingAnimations = useCallback(() => {
    animationRefs.floatLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -15,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    );
    
    animationRefs.floatLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 15,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        })
      ])
    );
    
    animationRefs.floatLoop1.start();
    animationRefs.floatLoop2.start();
  }, [floatAnim1, floatAnim2, animationRefs]);

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
      
      const entranceAnimation = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]);
      
      entranceAnimation.start();
      startFloatingAnimations();
      
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (navigation.isFocused()) {
          setIsNavigating(false);
          return false;
        }
        return false;
      });
      
      return () => {
        entranceAnimation.stop();
        Object.values(animationRefs).forEach(anim => anim?.stop());
        backHandler.remove();
      };
    }, [navigation, fadeAnim, slideUpAnim, logoScale, startFloatingAnimations, animationRefs])
  );

  const handleButtonPress = useCallback((role, buttonScale) => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    const buttonAnimation = Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]);
    
    const exitAnimation = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });
    
    Animated.sequence([buttonAnimation, exitAnimation]).start(() => {
      navigation.navigate("Login", { role });
      setTimeout(() => setIsNavigating(false), 500);
    });
  }, [fadeAnim, isNavigating, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background with subtle gradient */}
      <LinearGradient
        colors={[COLORS.background, COLORS.surface, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      {/* Subtle floating decorative elements */}
      <Animated.View 
        style={[
          styles.decorativeCircle,
          styles.circle1,
          { transform: [{ translateY: floatAnim1 }] }
        ]}
      />
      <Animated.View 
        style={[
          styles.decorativeCircle,
          styles.circle2,
          { transform: [{ translateY: floatAnim2 }] }
        ]}
      />
      
      <SafeAreaView style={styles.content}>
        <Animated.View style={[
          styles.mainContent,
          { opacity: fadeAnim }
        ]}>
          {/* Logo Section */}
          <Animated.View style={[
            styles.logoSection,
            { 
              transform: [
                { scale: logoScale },
                { translateY: slideUpAnim }
              ] 
            }
          ]}>
            {/* Simple, professional logo */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoCircle}
              >
                <Text style={styles.logoLetter}>V</Text>
              </LinearGradient>
            </View>
            
            <Text style={styles.brandName}>Veldt</Text>
            <Text style={styles.tagline}>Professional Services Platform</Text>
          </Animated.View>
          
          {/* Welcome Text */}
          <Animated.View style={[
            styles.welcomeSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }] 
            }
          ]}>
            <Text style={styles.welcomeTitle}>Welcome</Text>
            <Text style={styles.welcomeDescription}>
              Connect with trusted professionals or offer your services to clients who need them.
            </Text>
          </Animated.View>
          
          {/* Action Buttons */}
          <Animated.View style={[
            styles.buttonSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }] 
            }
          ]}>
            <TouchableOpacity 
              onPress={() => handleButtonPress("Client", clientButtonScale)}
              activeOpacity={0.9}
              disabled={isNavigating}
            >
              <Animated.View style={[
                styles.primaryButton,
                { transform: [{ scale: clientButtonScale }] }
              ]}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Continue as Client</Text>
                  <View style={styles.buttonArrow}>
                    <Text style={styles.arrowIcon}>→</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleButtonPress("Provider", providerButtonScale)}
              activeOpacity={0.9}
              disabled={isNavigating}
            >
              <Animated.View style={[
                styles.secondaryButton,
                { transform: [{ scale: providerButtonScale }] }
              ]}>
                <View style={styles.secondaryButtonContent}>
                  <Text style={styles.secondaryButtonText}>Continue as Service Provider</Text>
                  <View style={styles.buttonArrowOutline}>
                    <Text style={styles.arrowIconOutline}>→</Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Footer */}
          <Animated.View style={[
            styles.footer,
            { opacity: fadeAnim }
          ]}>
            <Text style={styles.footerText}>
              Trusted by thousands of professionals nationwide
            </Text>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.05,
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: COLORS.primary,
    top: -width * 0.4,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: COLORS.secondary,
    bottom: -width * 0.2,
    left: -width * 0.3,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoLetter: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  brandName: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 12,
  },
  welcomeDescription: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  buttonSection: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  buttonArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  secondaryButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  buttonArrowOutline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIconOutline: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '400',
  },
});

export default WelcomeScreen;