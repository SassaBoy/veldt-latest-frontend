import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BankTransferScreen = ({ navigation }) => {
  
  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    // You could replace this with a Toast message for a better UX
    Alert.alert('Copied', `${label} has been copied to your clipboard.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButtonInner} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#1a237e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Transfer</Text>
          <View style={styles.headerIconInner}>
            <Icon name="account-balance" size={24} color="#1a237e" />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Total Amount to Pay</Text>
            <Text style={styles.amountValue}>N$ 180.00</Text>
            <TouchableOpacity 
              style={styles.copyBadge}
              onPress={() => copyToClipboard('180.00', 'Amount')}
            >
              <Icon name="content-copy" size={16} color="#1a237e" />
              <Text style={styles.copyBadgeText}>COPY AMOUNT</Text>
            </TouchableOpacity>
          </View>

          {/* Reference Banner */}
          <View style={styles.referenceBanner}>
            <View style={styles.bannerIconWrapper}>
              <Icon name="priority-high" size={20} color="#e65100" />
            </View>
            <View style={styles.bannerTextContent}>
              <Text style={styles.bannerTitle}>Required Reference</Text>
              <Text style={styles.bannerSubtitle}>
                Use your registered phone number as the reference for instant tracking.
              </Text>
            </View>
          </View>

          {/* Bank Details */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Official Bank Account</Text>
            <View style={styles.detailCard}>
              <DetailRow 
                label="Account Name" 
                value="Veldt Namibia Services" 
                onPress={() => copyToClipboard('Veldt Namibia Services', 'Account Name')}
              />
              <DetailRow 
                label="Bank Name" 
                value="First National Bank (FNB)" 
                onPress={() => copyToClipboard('First National Bank', 'Bank Name')}
              />
              <DetailRow 
                label="Account Number" 
                value="62272889076" 
                onPress={() => copyToClipboard('62272889076', 'Account Number')}
              />
              <DetailRow 
                label="Branch Code" 
                value="280172" 
                onPress={() => copyToClipboard('280172', 'Branch Code')}
              />
              <DetailRow 
                label="Account Type" 
                value="Business Cheque" 
                hideCopy
              />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Next Steps</Text>
            <View style={styles.instructionCard}>
              <StepItem 
                icon="app-registration" 
                text="Open your banking app and make the transfer using the details above." 
              />
              <StepItem 
                icon="file-download" 
                text="Download or take a screenshot of your Proof of Payment." 
              />
              <StepItem 
                icon="verified" 
                text="Your service will be activated once the payment is reflected (typically 1-2 hours for FNB users)." 
                isLast
              />
            </View>
          </View>

          {/* Support CTA */}
          <TouchableOpacity style={styles.supportButton}>
            <Icon name="headset-mic" size={20} color="#666" />
            <Text style={styles.supportButtonText}>Having trouble? Contact Support</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Reusable Components
const DetailRow = ({ label, value, onPress, hideCopy }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailTextWrapper}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
    {!hideCopy && (
      <TouchableOpacity style={styles.rowCopyButton} onPress={onPress}>
        <Icon name="content-copy" size={18} color="#1a237e" />
      </TouchableOpacity>
    )}
  </View>
);

const StepItem = ({ icon, text, isLast }) => (
  <View style={[styles.stepItem, !isLast && styles.stepBorder]}>
    <View style={styles.stepIconWrapper}>
      <Icon name={icon} size={20} color="#1a237e" />
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fc' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#1a237e' },
  headerIconInner: { width: 40, alignItems: 'flex-end' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  amountLabel: { fontSize: 14, color: '#666', fontWeight: '600', marginBottom: 8 },
  amountValue: { fontSize: 36, fontWeight: '900', color: '#1a237e', marginBottom: 16 },
  copyBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  copyBadgeText: { fontSize: 12, fontWeight: '800', color: '#1a237e' },
  referenceBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContent: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '800', color: '#e65100', marginBottom: 2 },
  bannerSubtitle: { fontSize: 12, color: '#ef6c00', lineHeight: 18 },
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#1a237e', marginBottom: 12, marginLeft: 4 },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  detailTextWrapper: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  rowCopyButton: {
    padding: 8,
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    borderRadius: 8,
  },
  instructionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  stepItem: { flexDirection: 'row', paddingVertical: 12, gap: 16 },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  stepIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 20,
  },
  supportButtonText: { fontSize: 14, color: '#666', fontWeight: '500' },
});

export default BankTransferScreen;