import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ScrollView, 
  SafeAreaView, 
  Dimensions,
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#1a237e';

const SupportScreen = ({ navigation }) => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:info@veldt.com').catch(err => {
      console.error('Could not open email app', err);
    });
  };

  const handleCallPress = () => {
    Linking.openURL('tel:+264816889761').catch(err => {
      console.error('Could not open phone app', err);
    });
  };

  const supportItems = [
    {
      title: 'Benefits of using veldt',
      screen: 'Benefits',
      icon: 'card-giftcard',
      gradient: ['#4CAF50', '#2E7D32'],
      description: 'Discover what makes us special',
    },
    {
      title: 'Frequently Asked Questions',
      screen: 'FAQScreen',
      icon: 'help-outline',
      gradient: ['#2196F3', '#1565C0'],
      description: 'Get quick answers to common questions',
    },
    {
      title: 'Privacy Policy',
      screen: 'Privacy',
      icon: 'verified-user',
      gradient: ['#9C27B0', '#7B1FA2'],
      description: 'How we protect your data',
    },
    {
      title: 'Payment Terms',
      screen: 'PaymentTerms',
      icon: 'payment',
      gradient: ['#009688', '#00796B'],
      description: 'Payment methods and policies',
    },
    {
      title: 'Terms and Conditions',
      screen: 'Terms',
      icon: 'description',
      gradient: ['#FF9800', '#EF6C00'],
      description: 'User agreement and guidelines',
    }
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=61567409875373',
      color: '#1877F2',
      materialIcon: 'facebook',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/veldt.namibia/',
      color: '#E4405F',
      materialIcon: 'camera-alt',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/veldt/?viewAsMember=true',
      color: '#0A66C2',
      materialIcon: 'work',
    }
  ];

  const handleSocialPress = (url) => {
    Linking.openURL(url).catch(err => {
      console.error('Could not open URL', err);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Support Center</Text>
            <Text style={styles.headerSubtitle}>We're here to help</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Help Center Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="support-agent" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Help Center</Text>
          </View>
          
          {supportItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
              accessibilityLabel={item.title}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Icon name={item.icon} size={28} color="#fff" />
              </LinearGradient>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <Icon name="chevron-right" size={28} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="contact-support" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={handleEmailPress}
            accessibilityLabel="Send email to veldt"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F44336', '#C62828']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactIconContainer}
            >
              <Icon name="email" size={28} color="#fff" />
            </LinearGradient>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>info@veldt.com</Text>
              <View style={styles.contactBadge}>
                <Icon name="schedule" size={14} color="#4CAF50" />
                <Text style={styles.contactBadgeText}>Response within 24h</Text>
              </View>
            </View>
            <Icon name="open-in-new" size={22} color={PRIMARY_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard}
            onPress={handleCallPress}
            accessibilityLabel="Call veldt support"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2196F3', '#1565C0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactIconContainer}
            >
              <Icon name="phone" size={28} color="#fff" />
            </LinearGradient>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Phone Support</Text>
              <Text style={styles.contactValue}>+264 81 688 9761</Text>
              <View style={styles.contactBadge}>
                <Icon name="access-time" size={14} color="#4CAF50" />
                <Text style={styles.contactBadgeText}>Mon-Fri 9AM-5PM</Text>
              </View>
            </View>
            <Icon name="phone-in-talk" size={22} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>

        {/* Social Media Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Icon name="share" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Connect With Us</Text>
          </View>
          
          <View style={styles.socialContainer}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialCard}
                onPress={() => handleSocialPress(social.url)}
                accessibilityLabel={`Visit our ${social.name} page`}
                activeOpacity={0.8}
              >
                <View style={[styles.socialIconCircle, { backgroundColor: `${social.color}15` }]}>
                  <Icon name={social.materialIcon} size={32} color={social.color} />
                </View>
                <Text style={styles.socialName}>{social.name}</Text>
                <View style={[styles.socialBadge, { backgroundColor: social.color }]}>
                  <Icon name="arrow-forward" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Icon name="info-outline" size={18} color="#999" />
          <Text style={styles.versionText}>veldt v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  lastSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contactIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  contactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8f4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  contactBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  socialContainer: {
    gap: 12,
  },
  socialCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  socialIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  socialName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  socialBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
});

export default SupportScreen;