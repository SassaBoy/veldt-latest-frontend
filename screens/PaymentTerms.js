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
    title: 'Accepted Payment Methods',
    icon: 'payments',
    content:
      'Veldt supports secure transactions using Credit & Debit Cards (Visa, MasterCard), Mobile Money (E-wallets), Bank Transfers (EFT), and the secure DPO Group Payment Gateway.',
  },
  {
    title: 'Subscription & Billing',
    icon: 'account-balance',
    content:
      'Service providers access Veldt via a 30-Day Subscription (NAD 180). Subscriptions do not auto-renew; providers must manually renew to maintain platform access.',
  },
  {
    title: 'Provider Financial Terms',
    icon: 'business-center',
    content:
      'Providers handle transactions directly with clients outside the Veldt platform. Subscription payments must be cleared before the expiry date via EFT or card.',
  },
  {
    title: 'Client Financial Terms',
    icon: 'shopping-cart',
    content:
      'Clients pay service providers directly. While Veldt provides a secure environment for interactions, we do not process the direct service payments between parties.',
  },
  {
    title: 'Refund & Cancellation',
    icon: 'assignment-return',
    content:
      'No refunds for unused subscription periods. For services, full refunds apply if canceled within 24 hours. Disputes must be submitted within 7 days.',
  },
  {
    title: 'Security & Compliance',
    icon: 'verified-user',
    content:
      'We utilize SSL/TLS encryption and maintain PCI-DSS compliance. Our real-time fraud detection ensures your transaction data remains protected at all times.',
  },
  {
    title: 'Prohibited Activities',
    icon: 'report-problem',
    content:
      'Fraudulent transactions, circumventing our payment systems, or unauthorized account sharing may lead to immediate account suspension or legal action.',
  },
  {
    title: 'Legal Compliance',
    icon: 'gavel',
    content:
      'Governed by the laws of Namibia. Unresolved disputes proceed to arbitration through NAMFISA or the Namibian court system.',
  },
  {
    title: 'Contact Information',
    icon: 'contact-support',
    content:
      'Unit 13, Square Park, Windhoek, Namibia. Email: info@Veldt.com | Phone: +264 81 688 9761.',
  },
];

const PaymentTermsScreen = ({ navigation }) => {
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
                <Icon name="account-balance-wallet" size={32} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Payment Terms</Text>
            <Text style={styles.headerSubtitle}>
              Secure billing and financial guidelines
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
              <Icon name="shield" size={20} color="#1976d2" />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Secure Transactions</Text>
              <Text style={styles.infoBannerText}>
                We prioritize your financial security through encrypted gateways and 
                strict compliance with Namibian financial regulations.
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
              <Icon name="receipt-long" size={24} color="#1a237e" />
              <Text style={styles.contactTitle}>Billing Inquiry?</Text>
            </View>
            <Text style={styles.contactText}>
              Need a formal invoice or have a dispute regarding a subscription payment? 
              Our finance team is available to assist you.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              activeOpacity={0.7}
              onPress={() => { /* Contact logic */ }}
            >
              <Icon name="support-agent" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Billing</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 Veldt. All rights reserved.
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.footerLink}>Refund Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerSeparator}>•</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.footerLink}>Security Standards</Text>
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

export default PaymentTermsScreen;