import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, 
  ActivityIndicator, Animated, Platform, Alert, Dimensions
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { ArrowLeft, Shield, CheckCircle, XCircle, CreditCard, Download, FileText, Lock } from 'lucide-react-native';

export const VisaPaymentScreen: React.FC = () => {
  const { 
    isDarkMode, getGrandTotal, currentUser, validateAndProcessCheckout, navigateTo
  } = useAppContext();

  const { contentWidth } = useDimensions();

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

  // Live Credit Card formatting (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (text: string) => {
    const cleanStr = text.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleanStr.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleanStr[i];
    }
    setCardNumber(formatted);
    if (validationErrors.cardNumber) {
      setValidationErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  // Expiry date formatting (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleanStr = text.replace(/\D/g, '');
    let formatted = '';
    if (cleanStr.length > 0) {
      formatted += cleanStr.substring(0, 2);
    }
    if (cleanStr.length > 2) {
      formatted += '/' + cleanStr.substring(2, 4);
    }
    setExpiryDate(formatted);
    if (validationErrors.expiryDate) {
      setValidationErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  // CVV input formatting
  const handleCvvChange = (text: string) => {
    const cleanStr = text.replace(/\D/g, '').substring(0, 3);
    setCvv(cleanStr);
    if (validationErrors.cvv) {
      setValidationErrors(prev => ({ ...prev, cvv: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const cleanCardNo = cardNumber.replace(/\s/g, '');

    if (!cardHolder.trim()) {
      errors.cardHolder = 'Card holder name is required';
    }

    if (!cleanCardNo) {
      errors.cardNumber = 'Card number is required';
    } else if (cleanCardNo.length !== 16) {
      errors.cardNumber = 'Card number must contain 16 digits';
    } else if (cleanCardNo[0] !== '4') {
      errors.cardNumber = 'Invalid Visa card number (must start with 4)';
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryDate || !expiryRegex.test(expiryDate)) {
      errors.expiryDate = 'Invalid expiry date (MM/YY)';
    } else {
      const parts = expiryDate.split('/');
      const month = parseInt(parts[0], 10);
      const year = parseInt('20' + parts[1], 10);
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Card has expired';
      }
    }

    if (!cvv || cvv.length !== 3) {
      errors.cvv = 'CVV must be 3 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const processVisaPayment = async () => {
    if (!validateForm()) return;

    // Special CVV "999" triggers bank decline simulation
    const simulateFailure = cvv === '999';

    setIsProcessing(true);
    setProcessingStage('1. Verifying secure payment channel...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setProcessingStage('2. Encrypting CVV credentials with PCI 256-bit SSL...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      setProcessingStage('3. Querying transaction flow with core network...');
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (simulateFailure) {
        throw new Error('Bank declined transaction (Simulated CVV: code 999)');
      }

      // Complete purchase in backend
      const order = await validateAndProcessCheckout('Visa/Mastercard');
      if (!order) {
        throw new Error('Firestore order validation failed.');
      }

      const generatedRef = `VISA-2026-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setTxReference(generatedRef);

      setIsProcessing(false);
      setPaymentStatus('SUCCESS');

      Animated.spring(successScale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }).start();

    } catch (error: any) {
      console.log('Payment Gate Failed:', error);
      setIsProcessing(false);
      setPaymentStatus('FAILED');
      setFailedReason(error.message || 'Bank declined transaction due to temporary network error.');
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

  // Loading Stage View
  if (isProcessing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.success} />
        <Text style={[styles.loadingTitle, { color: colors.text }]}>Processing Secure Visa Payment</Text>
        <Text style={[styles.loadingStage, { color: colors.success }]}>{processingStage}</Text>
        <Text style={[styles.loadingFooter, { color: colors.subText }]}>Please do not close this screen or refresh</Text>
      </View>
    );
  }

  // SUCCESS PAGE
  if (paymentStatus === 'SUCCESS') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.container, styles.center, { maxWidth: contentWidth }]}>
          <Animated.View style={{ transform: [{ scale: successScale }], marginBottom: 16 }}>
            <CheckCircle size={72} color={colors.success} />
          </Animated.View>

          <Text style={[styles.successTitle, { color: colors.text }]}>Payment Successful</Text>
          <Text style={[styles.successSub, { color: colors.success }]}>Transaction Cleared</Text>
          <Text style={[styles.successDesc, { color: colors.subText }]}>
            Your Visa payment has been processed successfully. Dispatched delivery partner courier.
          </Text>

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
              <Text style={{ color: colors.subText, fontSize: 11 }}>Gateway Channel:</Text>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold' }}>Visa Platform</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 11 }}>Billing Account:</Text>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold' }}>{email}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 11 }}>Secure Status:</Text>
              <Text style={{ color: colors.success, fontSize: 11, fontWeight: 'bold' }}>Approved</Text>
            </View>
          </View>

          <View style={styles.btnGroup}>
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.surfaceVariant }]} onPress={() => Alert.alert('Receipt', 'Downloading receipt file...')}>
              <Download size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.btnText, { color: colors.text }]}>Download PDF Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.surfaceVariant }]} onPress={() => navigateTo('MAP')}>
              <FileText size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.btnText, { color: colors.text }]}>Live Courier Tracking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => navigateTo('HOME')}>
              <Text style={[styles.btnPrimaryText, { color: colors.background }]}>Back To Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // FAILED PAGE
  if (paymentStatus === 'FAILED') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.container, styles.center, { maxWidth: contentWidth }]}>
          <XCircle size={72} color={colors.error} style={{ marginBottom: 16 }} />

          <Text style={[styles.successTitle, { color: colors.text }]}>Payment Declined</Text>
          <Text style={[styles.successDesc, { color: colors.subText }]}>
            The card issuer network declined this secure transaction request.
          </Text>

          <View style={[styles.receiptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.error, fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>Possible Decline Reasons:</Text>
            <Text style={{ color: colors.subText, fontSize: 11, lineHeight: 16 }}>• {failedReason}</Text>
            <Text style={{ color: colors.subText, fontSize: 11, lineHeight: 16 }}>• Insufficient wallet/account credit balances</Text>
            <Text style={{ color: colors.subText, fontSize: 11, lineHeight: 16 }}>• Invalid CVV or expired card parameters</Text>
            <Text style={{ color: colors.subText, fontSize: 11, lineHeight: 16 }}>• Temporary network gateway outage between banks</Text>
          </View>

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

  // FORM RENDER STATE
  const last4 = cardNumber.replace(/\s/g, '').slice(-4);
  const maskedCardNo = cardNumber.replace(/\s/g, '').length > 4 
    ? cardNumber.replace(/\s/g, '').slice(0, 4) + ' •••• •••• ' + last4 
    : cardNumber;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { maxWidth: contentWidth }]}>
        
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigateTo('CHECKOUT')} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Checkout</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Visa Gateway</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* PCI SECURITY COMPLIANCE BADGE */}
        <View style={[styles.complianceBadge, { backgroundColor: 'rgba(0, 230, 118, 0.08)', borderColor: 'rgba(0, 230, 118, 0.3)' }]}>
          <Shield size={16} color="#00E676" />
          <Text style={styles.complianceText}>PCI-DSS SECURE 256-BIT SSL ENCRYPTED CONNECTION</Text>
        </View>

        {/* CARD MOCKUP PANEL */}
        <View style={[styles.visaCard, { backgroundColor: '#2E1065', borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>VISA PLATINUM</Text>
            <CreditCard size={28} color="#FFF" />
          </View>
          
          <View style={styles.cardChip} />
          
          <Text style={styles.cardNoText}>
            {maskedCardNo || '4123 4567 8901 2345'}
          </Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>CARD HOLDER</Text>
              <Text style={styles.footerVal}>{cardHolder.toUpperCase() || 'YOUR NAME HERE'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>EXPIRES</Text>
              <Text style={styles.footerVal}>{expiryDate || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        {/* AMOUNT CARD */}
        <View style={[styles.amountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.subText, fontSize: 11 }}>Total Payable Billing Sum:</Text>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: 'black' }}>LKR {amount.toLocaleString()}</Text>
        </View>

        {/* INPUT FORMS */}
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
            <Text style={[styles.inputLabel, { color: colors.subText }]}>VISA CARD NUMBER</Text>
            <TextInput
              style={[styles.inputBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
              placeholder="4123 4567 8901 2345"
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
              <TextInput
                style={[styles.inputBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                placeholder="MM/YY"
                placeholderTextColor={colors.subText}
                keyboardType="numeric"
                value={expiryDate}
                onChangeText={handleExpiryChange}
              />
              {validationErrors.expiryDate && <Text style={styles.errorLabel}>⚠️ {validationErrors.expiryDate}</Text>}
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

        {/* PAY SUBMIT BUTTON */}
        <TouchableOpacity style={[styles.paySubmitBtn, { backgroundColor: colors.primary }]} onPress={processVisaPayment}>
          <Lock size={16} color={colors.background} />
          <Text style={[styles.paySubmitBtnText, { color: colors.background }]}>
            Securely Pay LKR {amount.toLocaleString()}
          </Text>
        </TouchableOpacity>

        {/* COMPLIANCE DISCLAIMER */}
        <Text style={[styles.disclaimerText, { color: colors.subText }]}>
          Tips: Use CVV code <Text style={{fontWeight: 'bold', color: colors.primary}}>999</Text> to trigger a simulated bank declined failure response panel for demonstration testing.
        </Text>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
    justifyContent: 'center',
  },
  complianceText: {
    color: '#00E676',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  visaCard: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardChip: {
    width: 32,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    marginTop: 8,
  },
  cardNoText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 1.5,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 7,
  },
  footerVal: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  amountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  inputBox: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  errorLabel: {
    color: '#FF1744',
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 2,
  },
  paySubmitBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paySubmitBtnText: {
    fontSize: 13,
    fontWeight: '900',
  },
  disclaimerText: {
    fontSize: 8.5,
    lineHeight: 12,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    height: Dimensions.get('window').height * 0.7,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 16,
  },
  loadingStage: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: 'bold',
  },
  loadingFooter: {
    fontSize: 10,
    marginTop: 20,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  successSub: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  successDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  receiptCard: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginVertical: 16,
  },
  receiptHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  btnGroup: {
    width: '100%',
    gap: 10,
  },
  secondaryBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  primaryBtn: {
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '900',
  }
});
