import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PaymentMethodScreen = ({ navigation }) => {
  const paymentMethods = [
    {
      id: '1',
      title: 'Card Payment',
      icon: 'credit-card',
      color: '#4CAF50',
      screen: 'CardPayment',
      description: 'Pay with credit or debit card',
      badge: 'Popular',
    },
    {
      id: '2',
      title: 'Bank Transfer',
      icon: 'account-balance',
      color: '#1976D2',
      screen: 'BankTransferScreen',
      description: 'Direct bank transfer payment',
    },
    {
      id: '3',
      title: 'Mobile Payment',
      icon: 'smartphone',
      color: '#E91E63',
      screen: 'MobilePaymentScreen',
      description: 'Pay using mobile payment services',
      badge: 'Fast',
    },
  ];

  const handlePaymentMethodPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonInner}>
              <Icon name="arrow-back" size={24} color="#1a237e" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIconInner}>
                <Icon name="payment" size={32} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Payment Methods</Text>
            <Text style={styles.headerSubtitle}>
              Choose your preferred payment option
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrapper}>
              <Icon name="info" size={20} color="#1976d2" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Secure Payments</Text>
              <Text style={styles.infoText}>
                All payment methods are encrypted and secure. Choose the option
                that works best for you.
              </Text>
            </View>
          </View>

          {/* Payment Methods Section */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Available Payment Methods</Text>

            {paymentMethods.map((method, index) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentCard,
                  index === 0 && styles.paymentCardFirst,
                ]}
                onPress={() => handlePaymentMethodPress(method.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.paymentCardContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${method.color}15` },
                    ]}
                  >
                    <Icon name={method.icon} size={28} color={method.color} />
                  </View>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentTitleRow}>
                      <Text style={styles.paymentTitle}>{method.title}</Text>
                      {method.badge && (
                        <View
                          style={[
                            styles.badge,
                            method.badge === 'Popular' && styles.badgePopular,
                            method.badge === 'Fast' && styles.badgeFast,
                          ]}
                        >
                          <Text style={styles.badgeText}>{method.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.paymentDescription}>
                      {method.description}
                    </Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Icon name="arrow-forward-ios" size={18} color="#1a237e" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresSectionTitle}>Why Pay With Us?</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureCard}>
                <View style={styles.featureIconWrapper}>
                  <Icon name="security" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.featureTitle}>Secure</Text>
                <Text style={styles.featureText}>
                  Bank-level encryption
                </Text>
              </View>
              <View style={styles.featureCard}>
                <View style={styles.featureIconWrapper}>
                  <Icon name="flash-on" size={24} color="#FF9800" />
                </View>
                <Text style={styles.featureTitle}>Fast</Text>
                <Text style={styles.featureText}>
                  Instant processing
                </Text>
              </View>
              <View style={styles.featureCard}>
                <View style={styles.featureIconWrapper}>
                  <Icon name="verified-user" size={24} color="#1976D2" />
                </View>
                <Text style={styles.featureTitle}>Protected</Text>
                <Text style={styles.featureText}>
                  Buyer protection
                </Text>
              </View>
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.supportSection}>
            <View style={styles.supportIconWrapper}>
              <Icon name="help-outline" size={20} color="#1a237e" />
            </View>
            <View style={styles.supportTextContainer}>
              <Text style={styles.supportTitle}>Need Help?</Text>
              <Text style={styles.supportText}>
                Contact our support team if you have any questions about payments
              </Text>
            </View>
            <TouchableOpacity style={styles.supportButton} activeOpacity={0.7}>
              <Icon name="chat-bubble-outline" size={20} color="#1a237e" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  headerIconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a237e',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 14,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1565c0',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 19,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  paymentCardFirst: {
    borderColor: '#1a237e',
    borderWidth: 2,
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePopular: {
    backgroundColor: '#fff3e0',
  },
  badgeFast: {
    backgroundColor: '#e8f5e9',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff9800',
  },
  paymentDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 35, 126, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  featuresSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 35, 126, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  supportSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  supportIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTextContainer: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 3,
  },
  supportText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },
  supportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PaymentMethodScreen;