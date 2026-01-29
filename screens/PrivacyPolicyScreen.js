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
    title: 'Data Collection & Usage',
    icon: 'data-usage',
    content:
      'Veldt collects and processes certain information to provide a seamless and secure service experience. We are committed to transparency in how we handle your data.',
  },
  {
    title: 'Information You Provide',
    icon: 'person',
    content:
      'When using our platform, you may be required to provide personal information, service provider details, booking information, and payment details. This information helps us deliver personalized services.',
  },
  {
    title: 'Information Collected Automatically',
    icon: 'settings',
    content:
      'We may collect certain technical and usage data when you interact with our platform, including device information, usage data, and location data to improve your experience.',
  },
  {
    title: 'How We Use Your Information',
    icon: 'analytics',
    content:
      'Veldt utilizes collected data to improve booking processes, enhance platform performance, provide customer support, and comply with legal requirements.',
  },
  {
    title: 'Data Retention',
    icon: 'schedule',
    content:
      'We retain your information only as long as necessary to fulfill our obligations and legal requirements. You can request data deletion at any time.',
  },
  {
    title: 'How We Protect Your Data',
    icon: 'security',
    content:
      'Veldt implements industry-leading security measures including encryption, secure servers, and regular security audits to protect your data from unauthorized access, misuse, or loss.',
  },
  {
    title: 'Data Sharing',
    icon: 'share',
    content:
      'Some of your information may be shared with other users or trusted third parties to enhance your experience, improve our services, and fulfill legal obligations. We never sell your personal data.',
  },
  {
    title: 'Cookie Policy',
    icon: 'cookie',
    content:
      'Veldt uses cookies and similar technologies to provide a secure, efficient, and personalized experience. You can manage cookie preferences in your browser settings.',
  },
  {
    title: 'External Links',
    icon: 'link',
    content:
      'Veldt may contain links to external websites or social media platforms. Please be aware that these websites have their own privacy policies, and we are not responsible for their practices.',
  },
  {
    title: 'Policy Updates',
    icon: 'update',
    content:
      'We may update our Privacy Policy from time to time to reflect legal requirements, technological advancements, or service improvements. We will notify you of significant changes.',
  },
  {
    title: 'Contact Us',
    icon: 'email',
    content:
      'If you have any questions regarding our privacy practices, you can reach out to us via email at info@Veldt.com or through our in-app support system.',
  },
];

const PrivacyScreen = ({ navigation }) => {
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
                <Icon name="privacy-tip" size={32} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>
              How we protect and handle your data
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
              <Icon name="info" size={20} color="#1976d2" />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Your Privacy Matters</Text>
              <Text style={styles.infoBannerText}>
                We are committed to protecting your personal information and being
                transparent about our data practices.
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
              <Icon name="help-outline" size={24} color="#1a237e" />
              <Text style={styles.contactTitle}>Need Clarification?</Text>
            </View>
            <Text style={styles.contactText}>
              If you have questions about our privacy practices or want to
              exercise your data rights, we're here to help.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              activeOpacity={0.7}
              onPress={() => {
                // Navigate to support or open email
              }}
            >
              <Icon name="email" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 Veldt. All rights reserved.
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.footerSeparator}>•</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.footerLink}>Cookie Policy</Text>
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
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1565c0',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 19,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 6,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
  lastSection: {
    marginBottom: 20,
  },
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
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1a237e',
    letterSpacing: -0.3,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#666',
  },
  contactCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1a237e',
    ...Platform.select({
      ios: {
        shadowColor: '#1a237e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  contactText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#666',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a237e',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 13,
    color: '#1a237e',
    fontWeight: '600',
  },
  footerSeparator: {
    fontSize: 13,
    color: '#999',
  },
});

export default PrivacyScreen;