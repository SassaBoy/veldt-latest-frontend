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

const MobilePaymentScreen = ({ navigation }) => {
  
  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
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
          <Text style={styles.headerTitle}>Mobile Wallet</Text>
          <View style={styles.headerIconInner}>
            <Icon name="phonelink-ring" size={24} color="#1a237e" />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Card */}
          <View style={styles.amountCard}>
            <View style={styles.iconCircle}>
              <Icon name="smartphone" size={32} color="#1a237e" />
            </View>
            <Text style={styles.amountLabel}>Transfer Amount</Text>
            <Text style={styles.amountValue}>N$ 180.00</Text>
          </View>

          {/* Quick Copy Number Section */}
          <View style={styles.recipientSection}>
            <Text style={styles.sectionHeader}>Recipient Details</Text>
            <TouchableOpacity 
              style={styles.recipientCard}
              onPress={() => copyToClipboard('+264857886108', 'Phone Number')}
              activeOpacity={0.7}
            >
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientLabel}>MOBILE NUMBER</Text>
                <Text style={styles.recipientNumber}>+264 857 886 108</Text>
              </View>
              <View style={styles.copyIconBox}>
                <Icon name="content-copy" size={20} color="#1a237e" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Accepted Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Supported Wallets</Text>
            <View style={styles.methodsGrid}>
              <WalletBadge name="eWallet" icon="account-balance-wallet" />
              <WalletBadge name="Blue Wallet" icon="account-balance-wallet" />
              <WalletBadge name="Easy Wallet" icon="account-balance-wallet" />
            </View>
          </View>

          {/* Step by Step Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>How to Pay</Text>
            <View style={styles.instructionCard}>
              <InstructionStep 
                num="1"
                text="Open your banking app (FNB, Standard Bank, or Bank Windhoek)."
              />
              <InstructionStep 
                num="2"
                text="Choose the 'Send Money' or 'Wallet' option."
              />
              <InstructionStep 
                num="3"
                text="Enter the recipient number and exact amount shown above."
              />
              <InstructionStep 
                num="4"
                text="Complete the transfer and keep your SMS confirmation."
                isLast
              />
            </View>
          </View>

          {/* Verification Note */}
          <View style={styles.infoBox}>
            <Icon name="verified-user" size={20} color="#1a237e" />
            <Text style={styles.infoText}>
              Once sent, our system automatically verifies the transaction via the mobile network. Please allow up to 30 minutes for activation.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Sub-components
const WalletBadge = ({ name, icon }) => (
  <View style={styles.walletBadge}>
    <Icon name={icon} size={20} color="#1a237e" />
    <Text style={styles.walletName}>{name}</Text>
  </View>
);

const InstructionStep = ({ num, text, isLast }) => (
  <View style={[styles.stepRow, !isLast && styles.stepBorder]}>
    <View style={styles.stepNumberContainer}>
      <Text style={styles.stepNumberText}>{num}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eef0f7',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  amountLabel: { fontSize: 13, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  amountValue: { fontSize: 32, fontWeight: '900', color: '#1a237e', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#1a237e', marginBottom: 12, marginLeft: 4 },
  recipientSection: { marginBottom: 24 },
  recipientCard: {
    flexDirection: 'row',
    backgroundColor: '#1a237e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  recipientInfo: { flex: 1 },
  recipientLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  recipientNumber: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 4 },
  copyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodsGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eef0f7',
    gap: 8,
  },
  walletName: { fontSize: 13, fontWeight: '700', color: '#444' },
  instructionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 15 },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: '#f8f8f8' },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a237e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  stepText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  infoText: { flex: 1, fontSize: 12, color: '#1a237e', lineHeight: 18, fontWeight: '500' },
});

export default MobilePaymentScreen;