import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const benefits = [
  {
    title: 'Convenience',
    icon: 'home-repair-service',
    content: 'Book premium services from the comfort of your home with just a few taps. Our platform is designed for a seamless, mobile-first experience.',
  },
  {
    title: 'Time-saving',
    icon: 'timer',
    content: 'Eliminate the stress of searching. Find and book reliable, pre-vetted service providers in your area within seconds.',
  },
  {
    title: 'Safety & Security',
    icon: 'verified-user',
    content: 'Your peace of mind is our priority. Every service provider undergoes a rigorous vetting and verification process before joining Veldt.',
  },
  {
    title: 'Affordable Pricing',
    icon: 'account-balance-wallet',
    content: 'Access high-quality professional services at competitive rates. We believe premium service shouldn’t come with a premium price tag.',
  },
  {
    title: 'Quality Service',
    icon: 'auto-awesome',
    content: 'We maintain strict standards of professionalism. Our rating system ensures that only the best providers thrive on our platform.',
  },
];

const BenefitsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
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
                <Icon name="star" size={32} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Why Veldt?</Text>
            <Text style={styles.headerSubtitle}>
              The advantages of our ecosystem
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerIconWrapper}>
              <Icon name="lightbulb" size={20} color="#1976d2" />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Built for You</Text>
              <Text style={styles.infoBannerText}>
                We've built Veldt to solve the challenges of finding trusted 
                local services in Namibia quickly and safely.
              </Text>
            </View>
          </View>

          {/* Benefit Cards */}
          <View style={styles.content}>
            {benefits.map((benefit, index) => (
              <View
                key={index}
                style={[
                  styles.section,
                  index === benefits.length - 1 && styles.lastSection,
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrapper}>
                    <Icon name={benefit.icon} size={24} color="#1a237e" />
                  </View>
                  <Text style={styles.sectionTitle}>{benefit.title}</Text>
                </View>
                <Text style={styles.sectionText}>{benefit.content}</Text>
              </View>
            ))}
          </View>

          {/* Action Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Icon name="rocket-launch" size={24} color="#1a237e" />
              <Text style={styles.contactTitle}>Ready to begin?</Text>
            </View>
            <Text style={styles.contactText}>
              Experience the Veldt difference today. Whether you are providing 
              a service or looking for one, we've got you covered.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              activeOpacity={0.8}
              onPress={() => { /* Navigate to Signup */ }}
            >
              <Text style={styles.contactButtonText}>Get Started Now</Text>
              <Icon name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Empowering local service excellence.
            </Text>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Version 1.0.4</Text>
            </View>
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  backButton: { marginBottom: 16 },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { alignItems: 'center' },
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
  },
  headerSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  infoBannerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerContent: { flex: 1 },
  infoBannerTitle: { fontSize: 15, fontWeight: '700', color: '#1565c0', marginBottom: 4 },
  infoBannerText: { fontSize: 13, color: '#1976d2', lineHeight: 19 },
  content: { paddingHorizontal: 20 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  lastSection: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  sectionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#1a237e' },
  sectionText: { fontSize: 15, lineHeight: 24, color: '#666' },
  contactCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1a237e',
    ...Platform.select({
      ios: { shadowColor: '#1a237e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  contactHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  contactTitle: { fontSize: 18, fontWeight: '700', color: '#1a237e' },
  contactText: { fontSize: 14, lineHeight: 21, color: '#666', marginBottom: 16 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a237e',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 13, color: '#999', marginBottom: 4 },
  footerLink: { fontSize: 12, color: '#999', fontWeight: '400' },
});

export default BenefitsScreen;