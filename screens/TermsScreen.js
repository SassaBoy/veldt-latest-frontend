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

const sections = [
  {
    title: 'Agreement to Terms',
    icon: 'assignment-turned-in',
    content: 'By accessing or using Veldt’s platform, you confirm that you have read, understood, and agreed to these Terms & Conditions. If you do not agree with any part of these terms, you must refrain from using the platform.',
  },
  {
    title: 'User Registration & Security',
    icon: 'vpn-key',
    content: 'To access certain features, you must create an account. You agree to provide accurate information, maintain the confidentiality of your credentials, and notify Veldt of any unauthorized access immediately.',
  },
  {
    title: 'Service Provider Obligations',
    icon: 'verified',
    content: 'Providers must maintain valid business registrations and licenses as required by Namibian law. They must provide accurate service descriptions and respond to inquiries within 24 hours.',
  },
  {
    title: 'User Responsibilities',
    icon: 'groups',
    content: 'Users must engage in respectful interactions, provide honest feedback, respect privacy, and avoid fraudulent activities or any behavior that compromises platform integrity.',
  },
  {
    title: 'Payments, Fees & Refunds',
    icon: 'payments',
    content: 'All service fees are transparently stated before confirming a booking. Payments must be completed as agreed. Refunds are subject to Veldt’s established refund policy.',
  },
  {
    title: 'Prohibited Activities',
    icon: 'block',
    content: 'Users are prohibited from providing false information, engaging in illegal behavior, bypassing payment systems, or misusing customer data for external purposes.',
  },
  {
    title: 'Dispute Resolution & Liability',
    icon: 'gavel',
    content: 'Veldt facilitates mediation but is not liable for service-level disputes. Users must attempt to resolve issues through our mediation process before seeking legal action.',
  },
  {
    title: 'Data Protection',
    icon: 'security',
    content: 'Veldt safeguards user data under its Privacy Policy. We do not share data without consent, and users can request data access, modification, or deletion at any time.',
  },
  {
    title: 'Termination & Suspension',
    icon: 'person-off',
    content: 'Veldt reserves the right to suspend or terminate accounts due to policy violations, fraudulent activity, or legal requirements without prior notice.',
  },
  {
    title: 'Governing Law',
    icon: 'account-balance',
    content: 'These terms are governed by the laws of Namibia. Any legal disputes shall be subject to the jurisdiction of the High Court of Namibia. For legal inquiries, contact info@Veldt.com.',
  },
];

const TermsScreen = ({ navigation }) => {
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
                <Icon name="gavel" size={32} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <Text style={styles.headerSubtitle}>
              Rules and guidelines for our community
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
              <Icon name="handshake" size={20} color="#1976d2" />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Mutual Agreement</Text>
              <Text style={styles.infoBannerText}>
                Our terms are designed to create a safe, fair, and transparent 
                marketplace for both clients and service providers.
              </Text>
            </View>
          </View>

          {/* Last Updated */}
          <View style={styles.lastUpdated}>
            <Icon name="event" size={16} color="#666" />
            <Text style={styles.lastUpdatedText}>
              Last updated: January 29, 2026
            </Text>
          </View>

          {/* Sections */}
          <View style={styles.content}>
            {sections.map((section, index) => (
              <View
                key={index}
                style={[
                  styles.section,
                  index === sections.length - 1 && styles.lastSection,
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrapper}>
                    <Icon name={section.icon} size={24} color="#1a237e" />
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.sectionText}>{section.content}</Text>
              </View>
            ))}
          </View>

          {/* Contact Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Icon name="info" size={24} color="#1a237e" />
              <Text style={styles.contactTitle}>Have Questions?</Text>
            </View>
            <Text style={styles.contactText}>
              If you need further clarification on any of these points, please 
              don't hesitate to reach out to our legal team.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <Icon name="mail" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Email Legal Team</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 Veldt. All rights reserved.
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerSeparator}>•</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.footerLink}>Payment Terms</Text>
              </TouchableOpacity>
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
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
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
  lastUpdated: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20, gap: 6 },
  lastUpdatedText: { fontSize: 13, color: '#666', fontStyle: 'italic' },
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
  sectionTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#1a237e', letterSpacing: -0.3 },
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
  contactButtonText: { fontSize: 15, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  footer: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  footerText: { fontSize: 13, color: '#999', marginBottom: 12 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLink: { fontSize: 13, color: '#1a237e', fontWeight: '600' },
  footerSeparator: { fontSize: 13, color: '#999' },
});

export default TermsScreen;