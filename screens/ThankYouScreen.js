import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const ThankYouScreen = ({ navigation }) => {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Reset stack to Home after 5 seconds (prevents swipe-back to ThankYou)
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const checkmarkScale = checkmarkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.2, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.card}>
            {/* Success Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: checkmarkScale }],
                },
              ]}
            >
              <View style={styles.checkmarkCircle}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Icon name="check" size={52} color="#fff" />
                </Animated.View>
              </View>
              <View style={styles.successRing} />
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>Booking Confirmed!</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Your service booking has been successfully submitted
            </Text>

            <View style={styles.divider} />

            {/* Success Message */}
            <View style={styles.successBox}>
              <View style={styles.successIconBadge}>
                <Icon name="event-available" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.successMessage}>
                The service provider will review your request and respond shortly
              </Text>
            </View>

            {/* Timeline Steps */}
            <View style={styles.timelineContainer}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIconComplete}>
                  <Icon name="done-all" size={20} color="#fff" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Request Submitted</Text>
                  <Text style={styles.timelineSubtext}>Provider has been notified</Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={styles.timelineIconPending}>
                  <Icon name="hourglass-empty" size={20} color="#1a237e" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Under Review</Text>
                  <Text style={styles.timelineSubtext}>Typically responds within 2 hours</Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={styles.timelineIconPending}>
                  <Icon name="notifications-active" size={20} color="#1a237e" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Confirmation</Text>
                  <Text style={styles.timelineSubtext}>You'll receive a notification</Text>
                </View>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Icon name="info-outline" size={22} color="#1a237e" />
                <Text style={styles.infoHeaderText}>What Happens Next?</Text>
              </View>
              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <Icon name="mail-outline" size={18} color="#666" />
                  <Text style={styles.infoText}>
                    Confirmation email sent to your inbox
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="access-time" size={18} color="#666" />
                  <Text style={styles.infoText}>
                    Provider responds within <Text style={styles.infoBold}>2 hours</Text>
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="smartphone" size={18} color="#666" />
                  <Text style={styles.infoText}>
                    Track booking status in the app
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Tips */}
            <View style={styles.tipsBox}>
              <View style={styles.tipRow}>
                <Icon name="lightbulb-outline" size={18} color="#ff9800" />
                <Text style={styles.tipText}>
                  Keep your phone nearby for provider updates
                </Text>
              </View>
            </View>

            {/* Countdown */}
            <View style={styles.redirectNote}>
              <Icon name="home" size={16} color="#999" />
              <Text style={styles.redirectText}>
                Redirecting to home in 5 seconds...
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a237e",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    position: "relative",
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1a237e",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    marginTop: 20,                // ← moved down slightly to prevent top cutoff
    ...Platform.select({
      ios: {
        shadowColor: "#1a237e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  successRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(26, 35, 126, 0.2)",
    zIndex: 1,
    top: 10,                      // ← slight downward offset for ring
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a237e",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#e0e0e0",
    marginBottom: 24,
  },
  successBox: {
    width: "100%",
    backgroundColor: "#e8f5e9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  successIconBadge: {
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: "#2e7d32",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  timelineContainer: {
    width: "100%",
    marginBottom: 28,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineIconComplete: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a237e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  timelineIconPending: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(26, 35, 126, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 4,
  },
  timelineSubtext: {
    fontSize: 13,
    color: "#999",
    lineHeight: 18,
  },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: "#e0e0e0",
    marginLeft: 21,
    marginVertical: 8,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#f5f7fa",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  infoHeaderText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a237e",
  },
  infoContent: {
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: "700",
    color: "#1a237e",
  },
  tipsBox: {
    width: "100%",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffe0b2",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#e65100",
    lineHeight: 18,
    fontWeight: "500",
  },
  redirectNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  redirectText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
});

export default ThankYouScreen;