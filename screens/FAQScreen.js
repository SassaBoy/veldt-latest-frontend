import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: 'How do I book a service?',
    answer: 'Navigate to the "Services" section, select your required category, choose a provider, and follow the simple booking flow.',
  },
  {
    question: 'Are the service providers vetted?',
    answer: 'Absolutely. All service providers on Veldt undergo identity verification and background checks to ensure community safety.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept Visa, MasterCard, EFT bank transfers, and various Namibian mobile money wallets via our secure gateway.',
  },
  {
    question: 'Can I reschedule a booking?',
    answer: 'Yes. You can reschedule through the "My Bookings" tab up to 24 hours before the service start time without penalty.',
  },
  {
    question: 'What if I am not satisfied?',
    answer: 'Please contact our support team within 24 hours of service completion. We facilitate mediation to resolve any quality issues.',
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes. We use industry-standard SSL encryption and never share your sensitive data with third parties without consent.',
  },
  {
    question: 'How do I leave feedback?',
    answer: 'Once a service is marked as complete, you will be prompted to leave a star rating and a written review for the provider.',
  },
];

const FAQScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(null);

  const handlePress = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === index ? null : index);
  };

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
                <Icon name="quiz" size={32} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Support Center</Text>
            <Text style={styles.headerSubtitle}>
              Common questions and quick answers
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
              <Icon name="search" size={20} color="#1976d2" />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Search Tips</Text>
              <Text style={styles.infoBannerText}>
                Can't find what you're looking for? Tap a question to reveal 
                the detailed answer.
              </Text>
            </View>
          </View>

          {/* FAQ Accordion List */}
          <View style={styles.content}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.section}>
                <TouchableOpacity
                  onPress={() => handlePress(index)}
                  style={styles.faqHeader}
                  activeOpacity={0.7}
                >
                  <View style={styles.questionContainer}>
                    <View style={styles.sectionIconWrapper}>
                      <Text style={styles.questionNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                  </View>
                  <Icon 
                    name={expanded === index ? 'expand-less' : 'expand-more'} 
                    size={28} 
                    color="#1a237e" 
                  />
                </TouchableOpacity>
                
                {expanded === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Icon name="support-agent" size={24} color="#1a237e" />
              <Text style={styles.contactTitle}>Still stuck?</Text>
            </View>
            <Text style={styles.contactText}>
              Our dedicated support team is available Mon-Fri, 08:00 - 17:00 
              to help you with any platform issues.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <Icon name="chat" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Live Chat Support</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Veldt Knowledge Base • 2026
            </Text>
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
  content: { paddingHorizontal: 20 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a237e',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginRight: 8,
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswerText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  contactCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1a237e',
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
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontSize: 13, color: '#999' },
});

export default FAQScreen;