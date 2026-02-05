import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
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
        <Text style={styles.headerTitle}>About Veldt</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Logo / Branding */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Icon name="build" size={64} color="#1a237e" />
          </View>
          <Text style={styles.appName}>Veldt</Text>
          <Text style={styles.appTagline}>
            Connecting Namibia with trusted local service providers
          </Text>
          <Text style={styles.version}>Version 1.0.0 • Last Updated: 30/01/2026</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.sectionText}>
            Veldt is a user-friendly mobile app designed to connect clients and service providers seamlessly in Namibia. 
            Clients can easily browse, discover, and book trusted local services — from cleaning and plumbing to tutoring, 
            event planning, and more. Service providers gain visibility, manage bookings, and grow their business.
          </Text>
          <Text style={styles.sectionText}>
            Our goal is to make service discovery simple, safe, fast, and reliable — empowering both clients and providers.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>

          <View style={styles.featureGroup}>
            <Text style={styles.featureSubtitle}>For Clients</Text>
            <View style={styles.featureItem}>
              <Icon name="search" size={22} color="#1976d2" />
              <Text style={styles.featureText}>Browse services by category and location</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="star" size={22} color="#f57c00" />
              <Text style={styles.featureText}>View provider profiles, ratings & real reviews</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="calendar-today" size={22} color="#388e3c" />
              <Text style={styles.featureText}>Book and schedule appointments instantly</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="history" size={22} color="#1a237e" />
              <Text style={styles.featureText}>Track booking history and provide feedback</Text>
            </View>
          </View>

          <View style={styles.featureGroup}>
            <Text style={styles.featureSubtitle}>For Service Providers</Text>
            <View style={styles.featureItem}>
              <Icon name="room-service" size={22} color="#d81b60" />
              <Text style={styles.featureText}>List and manage your services</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="notifications" size={22} color="#1976d2" />
              <Text style={styles.featureText}>Receive real-time booking requests</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="star-border" size={22} color="#f57c00" />
              <Text style={styles.featureText}>Build reputation with reviews & ratings</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="schedule" size={22} color="#388e3c" />
              <Text style={styles.featureText}>Control availability and operating hours</Text>
            </View>
          </View>
        </View>

        {/* User Guide Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start Guide</Text>
          <Text style={styles.sectionText}>
            1. Download Veldt from Google Play or App Store{"\n"}
            2. Choose your role: Client or Service Provider{"\n"}
            3. Create your account and complete your profile{"\n"}
            4. Start browsing services or listing your own — it's that simple!
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('mailto:info@veldt.com')}
          >
            <Icon name="email" size={22} color="#1a237e" />
            <Text style={styles.linkText}>info@veldt.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('tel:+264816889761')}
          >
            <Icon name="phone" size={22} color="#1a237e" />
            <Text style={styles.linkText}>+264 81 688 9761 (Mon-Fri, 9AM–6PM)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Support')}
          >
            <Icon name="help" size={22} color="#1a237e" />
            <Text style={styles.linkText}>Help & Support Center</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2026 Veldt Investment cc. All rights reserved.
          </Text>
          <Text style={styles.madeIn}>
            Proudly built in Windhoek, Namibia
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {},
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    marginRight: 40,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a237e',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  version: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  featureGroup: {
    marginTop: 16,
  },
  featureSubtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    lineHeight: 22,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#1a237e',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 20,
  },
  copyright: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  madeIn: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});