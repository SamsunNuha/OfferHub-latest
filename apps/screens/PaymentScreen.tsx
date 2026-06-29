import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, Platform, Alert, Dimensions, Modal,
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { ArrowLeft, Shield, CheckCircle, XCircle, CreditCard, Download, FileText, Lock, Calendar } from 'lucide-react-native';
// Helper to detect basic card type (Visa/MasterCard/Other)
const detectCardType = (num: string) => {
  const clean = num.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('5')) return 'MasterCard';
  return 'Card';
};

export const PaymentScreen: React.FC = () => {
  const {
    isDarkMode, getGrandTotal, currentUser, validateAndProcessCheckout, navigateTo,
  } = useAppContext();
  const { contentWidth } = useDimensions();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const amount = getGrandTotal();
  const email = currentUser?.email || 'guest@offerlanka.com';

  // Form States
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [failedReason, setFailedReason] = useState('');
  const [txReference, setTxReference] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [successScale] = useState(new Animated.Value(0.3));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [paymentStatus]);

  const colors = isDarkMode ? {
    background: '#0C0717',
    surface: '#160F2B',
    surfaceVariant: '#22183D',
    border: '#3F2D6B',
    primary: '#C78DFF',
    secondary: '#8E24AA',
    text: '#FFFFFF',
    subText: '#B0A2C9',
    success: '#00E676',
    error: '#FF1744',
  } : {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    secondary: '#6200EA',
    text: '#120024',
    subText: '#6D5C80',
    success: '#2E7D32',
    error: '#C62828',
  };

  // Formatting helpers
  const handleCardNumberChange = (text: string) => {
    const cleanStr = text.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleanStr.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += cleanStr[i];
    }
    setCardNumber(formatted);
    if (validationErrors.cardNumber) setValidationErrors(prev => ({ ...prev, cardNumber: '' }));
  };

  const handleExpiryChange = (text: string) => {
    // Keep manual entry as fallback, but we encourage picker usage
    const cleanStr = text.replace(/\D/g, '');
    let formatted = '';
    if (cleanStr.length > 0) formatted += cleanStr.substring(0, 2);
    if (cleanStr.length > 2) formatted += '/' + cleanStr.substring(2, 4);
    setExpiryDate(formatted);
    if (validationErrors.expiryDate) setValidationErrors(prev => ({ ...prev, expiryDate: '' }));
  };

  const handleDatePicked = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      setExpiryDate(`${month}/${year}`);
      if (validationErrors.expiryDate) setValidationErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  const handleCvvChange = (text: string) => {
    const cleanStr = text.replace(/\D/g, '').substring(0, 3);
    setCvv(cleanStr);
    if (validationErrors.cvv) setValidationErrors(prev => ({ ...prev, cvv: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const cleanCardNo = cardNumber.replace(/\s/g, '');

    if (!cardHolder.trim()) errors.cardHolder = 'Card holder name is required';
    if (!cleanCardNo) errors.cardNumber = 'Card number is required';
    else if (cleanCardNo.length !== 16) errors.cardNumber = 'Card number must contain 16 digits';
    // Simple Luhn check could be added, but omitted for brevity.

    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryDate || !expiryRegex.test(expiryDate)) {
      errors.expiryDate = 'Invalid expiry date (MM/YY)';
    } else {
      const [m, y] = expiryDate.split('/');
      const month = parseInt(m, 10);
      const year = parseInt('20' + y, 10);
      const today = new Date();
      if (year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1)) {
        errors.expiryDate = 'Card has expired';
      }
    }

    if (!cvv || cvv.length !== 3) errors.cvv = 'CVV must be 3 digits';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const processPayment = async () => {
    if (!validateForm()) return;
    const simulateFailure = cvv === '999';
    setIsProcessing(true);
    setProcessingStage('1. Verifying secure payment channel...');
    try {
      await new Promise(r => setTimeout(r, 1200));
      setProcessingStage('2. Encrypting CVV credentials...');
      await new Promise(r => setTimeout(r, 1200));
      setProcessingStage('3. Contacting bank network...');
      await new Promise(r => setTimeout(r, 1200));

      if (simulateFailure) throw new Error('Bank declined transaction (Simulated CVV: 999)');

      const order = await validateAndProcessCheckout('Card');
      if (!order) throw new Error('Checkout validation failed');

      const generatedRef = `CARD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      setTxReference(generatedRef);
      setIsProcessing(false);
      setPaymentStatus('SUCCESS');
      Animated.spring(successScale, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }).start();
    } catch (e: any) {
      console.log('Payment error:', e);
      setIsProcessing(false);
      setPaymentStatus('FAILED');
      setFailedReason(e.message || 'Transaction failed');
    }
  };

  const handleTryAgain = () => {
    setPaymentStatus('IDLE');
    setValidationErrors({});
  };
  const handleChangeCard = () => {
    setPaymentStatus('IDLE');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardHolder('');
    setValidationErrors({});
  };

  // Render loading
  if (isProcessing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.success} />
        <Text style={[styles.loadingTitle, { color: colors.text }]}>Processing Secure Card Payment</Text>
        <Text style={[styles.loadingStage, { color: colors.success }]}>{processingStage}</Text>
        <Text style={[styles.loadingFooter, { color: colors.subText }]}>Please do not close this screen</Text>
      </View>
    );
  }

  // Success view
  if (paymentStatus === 'SUCCESS') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.container, styles.center, { maxWidth: contentWidth }]}>
          <Animated.View style={{ transform: [{ scale: successScale }], marginBottom: 16 }}>
            <CheckCircle size={72} color={colors.success} />
          </Animated.View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Payment Successful</Text>
          <Text style={[styles.successSub, { color: colors.success }]}>Transaction Cleared</Text>
          <Text style={[styles.successDesc, { color: colors.subText }]}>Your payment has been processed securely.</Text>
          <View style={[styles.receiptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.receiptHeader, { color: colors.subText }]}>SECURE TRANSACTION RECEIPT</Text>
            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 11 }}>Reference Number:</Text>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold' }}>{txReference}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 11 }}>Amount Paid:</Text>
              <Text style={{ color: colors.success, fontSize: 13, fontWeight: 'bold' }}>LKR {amount.toLocaleString()}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 11 }}>Card Type:</Text>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold' }}>{detectCardType(cardNumber)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 11 }}>Billing Account:</Text>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold' }}>{email}</Text>
            </View>
          </View>
          <View style={styles.btnGroup}>
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.surfaceVariant }]} onPress={() => Alert.alert('Receipt', 'Downloading receipt...')}>
              <Download size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.btnText, { color: colors.text }]}>Download PDF Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => navigateTo('HOME')}>
              <Text style={[styles.btnPrimaryText, { color: colors.background }]}>Back To Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Failure view
  if (paymentStatus === 'FAILED') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.container, styles.center, { maxWidth: contentWidth }]}>
          <XCircle size={72} color={colors.error} style={{ marginBottom: 16 }} />
          <Text style={[styles.successTitle, { color: colors.text }]}>Payment Declined</Text>
          <Text style={[styles.successDesc, { color: colors.subText }]}>{failedReason}</Text>
          <View style={styles.btnGroup}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleTryAgain}>
              <Text style={[styles.btnPrimaryText, { color: colors.background }]}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.surfaceVariant }]} onPress={handleChangeCard}>
              <Text style={[styles.btnText, { color: colors.text }]}>Change Card Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.surfaceVariant }]} onPress={() => navigateTo('CHECKOUT')}>
              <Text style={[styles.btnText, { color: colors.text }]}>Back to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Form view
  const last4 = cardNumber.replace(/\s/g, '').slice(-4);
  const maskedCardNo = cardNumber.replace(/\s/g, '').length > 4 ? `${cardNumber.replace(/\s/g, '').slice(0, 4)} •••• •••• ${last4}` : cardNumber;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { maxWidth: contentWidth }]}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigateTo('CHECKOUT')} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Checkout</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Card Payment</Text>
          <View style={{ width: 60 }} />
        </View>
        {/* Compliance badge */}
        <View style={[styles.complianceBadge, { backgroundColor: 'rgba(0, 230, 118, 0.08)', borderColor: 'rgba(0, 230, 118, 0.3)' }]}>
          <Shield size={16} color="#00E676" />
          <Text style={styles.complianceText}>PCI-DSS SECURE 256-BIT SSL ENCRYPTED CONNECTION</Text>
        </View>
        {/* Card mockup */}
        <View style={[styles.visaCard, { backgroundColor: '#2E1065', borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>{detectCardType(cardNumber)}</Text>
            <CreditCard size={28} color="#FFF" />
          </View>
          <View style={styles.cardChip} />
          <Text style={styles.cardNoText}>{maskedCardNo || '4111 1111 1111 1111'}</Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>CARD HOLDER</Text>
              <Text style={styles.footerVal}>{cardHolder.toUpperCase() || 'YOUR NAME'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>EXPIRES</Text>
              <Text style={styles.footerVal}>{expiryDate || 'MM/YY'}</Text>
            </View>
          </View>
        </View>
        {/* Amount card */}
        <View style={[styles.amountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.subText, fontSize: 11 }}>Total Payable:</Text>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: 'black' }}>LKR {amount.toLocaleString()}</Text>
        </View>
        {/* Input forms */}
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>CARDHOLDER NAME</Text>
            <TextInput
              style={[styles.inputBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
              placeholder="As printed on front of card"
              placeholderTextColor={colors.subText}
              autoCapitalize="characters"
              value={cardHolder}
              onChangeText={setCardHolder}
            />
            {validationErrors.cardHolder && <Text style={styles.errorLabel}>⚠️ {validationErrors.cardHolder}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>CARD NUMBER</Text>
            <TextInput
              style={[styles.inputBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
              placeholder="4111 1111 1111 1111"
              placeholderTextColor={colors.subText}
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
            />
            {validationErrors.cardNumber && <Text style={styles.errorLabel}>⚠️ {validationErrors.cardNumber}</Text>}
          </View>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>EXPIRY DATE</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.inputBox, { flex: 1, backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.subText}
                    keyboardType="numeric"
                    value={expiryDate}
                    onChangeText={handleExpiryChange}
                  />
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.calendarBtn}>
                    <Calendar size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
                {validationErrors.expiryDate && <Text style={styles.errorLabel}>⚠️ {validationErrors.expiryDate}</Text>}
                {showDatePicker && (
                  <Modal visible={true} transparent={true} animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 14 }}>Select Expiry Date</Text>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <XCircle size={20} color={colors.text} />
                          </TouchableOpacity>
                        </View>
                        <Text style={{ color: colors.subText, fontSize: 10, fontWeight: 'bold', marginBottom: 8 }}>MONTH</Text>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => (
                            <TouchableOpacity
                              key={m}
                              style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderRadius: 6,
                                backgroundColor: expiryDate.startsWith(m) ? colors.primary : colors.surfaceVariant,
                                marginRight: 8,
                              }}
                              onPress={() => {
                                const yearPart = expiryDate.split('/')[1] || '26';
                                setExpiryDate(`${m}/${yearPart}`);
                                if (validationErrors.expiryDate) setValidationErrors(prev => ({ ...prev, expiryDate: '' }));
                              }}
                            >
                              <Text style={{ color: expiryDate.startsWith(m) ? '#FFF' : colors.text, fontSize: 11, fontWeight: 'bold' }}>{m}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        <Text style={{ color: colors.subText, fontSize: 10, fontWeight: 'bold', marginBottom: 8 }}>YEAR</Text>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                          {['26', '27', '28', '29', '30', '31', '32', '33', '34', '35'].map((y) => (
                            <TouchableOpacity
                              key={y}
                              style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderRadius: 6,
                                backgroundColor: expiryDate.endsWith(y) ? colors.primary : colors.surfaceVariant,
                                marginRight: 8,
                              }}
                              onPress={() => {
                                const monthPart = expiryDate.split('/')[0] || '01';
                                setExpiryDate(`${monthPart}/${y}`);
                                if (validationErrors.expiryDate) setValidationErrors(prev => ({ ...prev, expiryDate: '' }));
                              }}
                            >
                              <Text style={{ color: expiryDate.endsWith(y) ? '#FFF' : colors.text, fontSize: 11, fontWeight: 'bold' }}>20{y}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        <TouchableOpacity
                          style={{
                            backgroundColor: colors.primary,
                            paddingVertical: 10,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginTop: 6,
                          }}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={{ color: colors.background, fontWeight: '900', fontSize: 12 }}>CONFIRM DATE</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>CVV CODE</Text>
              <TextInput
                style={[styles.inputBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                placeholder="123"
                placeholderTextColor={colors.subText}
                keyboardType="numeric"
                secureTextEntry={true}
                value={cvv}
                onChangeText={handleCvvChange}
              />
              {validationErrors.cvv && <Text style={styles.errorLabel}>⚠️ {validationErrors.cvv}</Text>}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>BILLING STREET ADDRESS (OPTIONAL)</Text>
            <TextInput
              style={[styles.inputBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 104 Galle Rd, Colombo"
              placeholderTextColor={colors.subText}
              value={billingAddress}
              onChangeText={setBillingAddress}
            />
          </View>
        </View>
        {/* Pay button */}
        <TouchableOpacity style={[styles.paySubmitBtn, { backgroundColor: colors.primary }]} onPress={processPayment}>
          <Lock size={16} color={colors.background} />
          <Text style={[styles.paySubmitBtnText, { color: colors.background }]}>Securely Pay LKR {amount.toLocaleString()}</Text>
        </TouchableOpacity>
        <Text style={[styles.disclaimerText, { color: colors.subText }]}>Tips: Use CVV code <Text style={{fontWeight: 'bold', color: colors.primary}}>999</Text> to trigger a simulated decline.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', alignSelf: 'center', padding: 16, paddingBottom: 40 },
  center: { justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 14, fontWeight: 'bold' },
  headerTitle: { fontSize: 16, fontWeight: '900' },
  complianceBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 16, gap: 6, justifyContent: 'center' },
  complianceText: { color: '#00E676', fontSize: 7.5, fontWeight: 'bold' },
  visaCard: { height: 180, borderRadius: 16, borderWidth: 1, padding: 18, justifyContent: 'space-between', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  cardChip: { width: 32, height: 24, borderRadius: 4, backgroundColor: '#FFD700', marginTop: 8 },
  cardNoText: { color: '#FFF', fontSize: 17, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', letterSpacing: 1.5, marginVertical: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 7 },
  footerVal: { color: '#FFF', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  amountCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  formCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12, marginBottom: 20 },
  inputGroup: { gap: 4 },
  inputLabel: { fontSize: 8, fontWeight: 'bold' },
  inputBox: { height: 40, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, fontSize: 12 },
  formRow: { flexDirection: 'row', gap: 12 },
  calendarBtn: { padding: 4, marginLeft: 8 },
  errorLabel: { color: '#FF1744', fontSize: 9.5, fontWeight: '600', marginTop: 2 },
  paySubmitBtn: { flexDirection: 'row', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  paySubmitBtnText: { fontSize: 13, fontWeight: '900' },
  disclaimerText: { fontSize: 8.5, lineHeight: 12, textAlign: 'center', marginTop: 14, paddingHorizontal: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, height: Dimensions.get('window').height * 0.7 },
  loadingTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 16 },
  loadingStage: { fontSize: 12, marginTop: 6, fontWeight: 'bold' },
  loadingFooter: { fontSize: 10, marginTop: 20 },
  successTitle: { fontSize: 18, fontWeight: '900' },
  successSub: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  successDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginVertical: 12, paddingHorizontal: 16 },
  receiptCard: { width: '100%', padding: 14, borderRadius: 12, borderWidth: 1, gap: 8, marginVertical: 16 },
  receiptHeader: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1, marginBottom: 6 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, paddingBottom: 4 },
  btnGroup: { width: '100%', gap: 10 },
  secondaryBtn: { flexDirection: 'row', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  primaryBtn: { height: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  btnText: { fontSize: 12, fontWeight: 'bold' },
  btnPrimaryText: { fontSize: 13, fontWeight: '900' },
});

export default PaymentScreen;
