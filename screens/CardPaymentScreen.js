import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CardPaymentScreen = ({ navigation }) => {
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveDetails, setSaveDetails] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButtonInner} 
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#1a237e" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Method</Text>
            <View style={styles.headerIconInner}>
              <Icon name="security" size={20} color="#4caf50" />
            </View>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Visual Card Preview */}
            <View style={styles.visualCard}>
              <View style={styles.cardTop}>
                <Icon name="contactless" size={32} color="rgba(255,255,255,0.6)" />
                <Text style={styles.bankName}>VELDT SECURE</Text>
              </View>
              <Text style={styles.displayCardNumber}>
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardValue}>{cardHolderName.toUpperCase() || 'YOUR NAME'}</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardValue}>
                    {expiryMonth || 'MM'}/{expiryYear.slice(-2) || 'YY'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person-outline" size={22} color="#1a237e" />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    value={cardHolderName}
                    onChangeText={setCardHolderName}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="credit-card" size={22} color="#1a237e" />
                  <TextInput
                    style={styles.input}
                    placeholder="0000 0000 0000 0000"
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    maxLength={19}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1.2, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.expiryInput}
                      placeholder="MM"
                      keyboardType="numeric"
                      maxLength={2}
                      value={expiryMonth}
                      onChangeText={setExpiryMonth}
                    />
                    <Text style={styles.dateSlash}>/</Text>
                    <TextInput
                      style={styles.expiryInput}
                      placeholder="YYYY"
                      keyboardType="numeric"
                      maxLength={4}
                      value={expiryYear}
                      onChangeText={setExpiryYear}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 0.8 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={3}
                      value={cvv}
                      onChangeText={setCvv}
                    />
                    <Icon name="help-outline" size={18} color="#999" />
                  </View>
                </View>
              </View>

              {/* Toggles */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setSaveDetails(!saveDetails)}
                >
                  <Icon 
                    name={saveDetails ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color={saveDetails ? "#1a237e" : "#666"} 
                  />
                  <Text style={styles.checkboxText}>Save card for future use</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                >
                  <Icon 
                    name={agreeTerms ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color={agreeTerms ? "#1a237e" : "#666"} 
                  />
                  <Text style={styles.checkboxText}>
                    I agree to the <Text style={styles.linkText}>Payment Terms</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Footer Button */}
          <View style={styles.footer}>
            <View style={styles.securityNote}>
              <Icon name="lock" size={14} color="#666" />
              <Text style={styles.securityText}>AES-256 Encrypted Connection</Text>
            </View>
            <TouchableOpacity
              style={[styles.payButton, !agreeTerms && styles.payButtonDisabled]}
              disabled={!agreeTerms}
              activeOpacity={0.8}
            >
              <Text style={styles.payButtonText}>ADD CARD SECURELY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
  visualCard: {
    height: 200,
    backgroundColor: '#1a237e',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
    marginBottom: 30,
    ...Platform.select({
      ios: { shadowColor: '#1a237e', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
      android: { elevation: 10 },
    }),
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankName: { color: '#fff', fontWeight: 'bold', fontSize: 14, opacity: 0.8 },
  displayCardNumber: { color: '#fff', fontSize: 22, letterSpacing: 3, fontWeight: '600', marginVertical: 20 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  cardValue: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  formContainer: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#444', marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: { flex: 1, fontSize: 16, color: '#1a237e', fontWeight: '600', marginLeft: 10 },
  row: { flexDirection: 'row' },
  expiryInput: { flex: 1, fontSize: 16, color: '#1a237e', fontWeight: '600', textAlign: 'center' },
  dateSlash: { fontSize: 20, color: '#eee', marginHorizontal: 4 },
  toggleContainer: { marginTop: 10, gap: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkboxText: { fontSize: 14, color: '#666' },
  linkText: { color: '#1a237e', fontWeight: 'bold', textDecorationLine: 'underline' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 },
  securityText: { fontSize: 12, color: '#666', fontWeight: '500' },
  payButton: {
    backgroundColor: '#1a237e',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: { backgroundColor: '#ccc' },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});

export default CardPaymentScreen;