import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore'; // Firebase Firestore import
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Simple simulated sound / confetti trigger placeholders (can be replaced with real assets)
// import Sound from 'react-native-sound';
// import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

export default function PremiumVisaPaymentScreen({ route, navigation }) {
  // Amount passed via navigation params (default: 5000 LKR)
  const amount = route?.params?.amount || 5000;
  const userId = route?.params?.userId || 'USER_ID_2026';

  // State Fields
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  // UI / Logic States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('IDLE'); // IDLE, SUCCESS, FAILED
  const [failedReason, setFailedReason] = useState('');
  const [txReference, setTxReference] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

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

  // Card formatting helper function (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (text) => {
    // Clear non-digits
    const cleanStr = text.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleanStr.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleanStr[i];
    }
    setCardNumber(formatted);
    // Real-time error clearing
    if (validationErrors.cardNumber) {
      setValidationErrors((prev) => ({ ...prev, cardNumber: null }));
    }
  };

  // Expiry date formatting helper (MM/YY)
  const handleExpiryChange = (text) => {
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
      setValidationErrors((prev) => ({ ...prev, expiryDate: null }));
    }
  };

  // CVV input helper
  const handleCvvChange = (text) => {
    const cleanStr = text.replace(/\D/g, '').substring(0, 3);
    setCvv(cleanStr);
    if (validationErrors.cvv) {
      setValidationErrors((prev) => ({ ...prev, cvv: null }));
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    const cleanCardNo = cardNumber.replace(/\s/g, '');

    // Cardholder validation
    if (!cardHolder.trim()) {
      errors.cardHolder = 'Card holder name is required';
    }

    // Card number validation (Must be 16 digits and start with 4 for Visa)
    if (!cleanCardNo) {
      errors.cardNumber = 'Card number must contain 16 digits';
    } else if (cleanCardNo.length !== 16) {
      errors.cardNumber = 'Card number must contain 16 digits';
    } else if (cleanCardNo[0] !== '4') {
      errors.cardNumber = 'Invalid Visa card number';
    }

    // Expiry Date validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryDate || !expiryRegex.test(expiryDate)) {
      errors.expiryDate = 'Invalid expiry date';
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

    // CVV validation
    if (!cvv || cvv.length !== 3) {
      errors.cvv = 'CVV must be 3 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Payment process handler
  const processVisaPayment = async () => {
    if (!validateForm()) return;

    // Simulation Option: Special CVV "999" triggers simulated failure screen for demonstration
    const simulateFailure = cvv === '999';

    setIsProcessing(true);
    setProcessingStage('1. Verifying secure payment channel...');

    try {
      // Step A: Fake Gateway handshake animations
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProcessingStage('2. Encrypting CVV with PCI 256-bit SSL...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProcessingStage('3. Querying transaction flow with core network...');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (simulateFailure) {
        throw new Error('Bank declined transaction (Simulated: code 999)');
      }

      // Generate secure payment reference
      const generatedRef = `VISA-2026-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setTxReference(generatedRef);

      // Save transaction record to Firebase Firestore
      const last4 = cardNumber.replace(/\s/g, '').slice(-4);
      const paymentRecord = {
        paymentId: firestore().collection('payments').doc().id,
        userId: userId,
        amount: amount,
        cardLast4Digits: last4,
        status: 'Successful',
        paymentDate: new Date().toISOString(),
        transactionReference: generatedRef,
      };

      await firestore().collection('payments').doc(paymentRecord.paymentId).set(paymentRecord);

      // Play sound effect, etc. here if required

      // Success Setup
      setIsProcessing(false);
      setPaymentStatus('SUCCESS');

      // Animating Green Checkmark
      Animated.spring(successScale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      console.log('Payment Gate Failed:', error);
      setIsProcessing(false);
      setPaymentStatus('FAILED');
      setFailedReason(error.message || 'Bank declined transaction due to temporary network error.');
    }
  };

  // Try again / reset fields handlers
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

  // RENDER BLOCKS
  if (isProcessing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00E676" />
        <Text style={styles.loadingTitle}>Processing Secure Visa Payment</Text>
        <Text style={styles.loadingStage}>{processingStage}</Text>
        <Text style={styles.loadingFooter}>Please do not close the screen or refresh</Text>
      </View>
    );
  }

  // A. SUCCESS PAGE
  if (paymentStatus === 'SUCCESS') {
    return (
      <View style={[styles.container, styles.successContainer]}>
        {/* Confetti cannon container would go here */}
        
        <Animated.View style={[styles.checkmarkCircle, { transform: [{ scale: successScale }] }]}>
          <Icon name="check-circle" size={80} color="#00E676" />
        </Animated.View>

        <Text style={styles.successTitle}>✅ Payment Successful</Text>
        <Text style={styles.successSub}>Thank You!</Text>
        <Text style={styles.successDesc}>Your visa payment has been processed successfully.</Text>

        <View style={styles.receiptCard}>
          <Text style={styles.receiptHeader}>SECURE TRANSACTION RECEIPT</Text>
          
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Transaction Reference:</Text>
            <Text style={styles.receiptValue}>{txReference}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Amount Paid:</Text>
            <Text style={[styles.receiptValue, styles.boldValue]}>LKR {amount.toLocaleString()}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Payment Method:</Text>
            <Text style={styles.receiptValue}>Visa Card</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Date:</Text>
            <Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Status:</Text>
            <Text style={[styles.receiptValue, styles.statusSuccess]}>Successful</Text>
          </View>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => Alert.alert('Receipt', 'Downloading receipt to files...')}>
            <Icon name="download" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Download Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => Alert.alert('Status', 'Redirecting to your application processing status...')}>
            <Icon name="file-document-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>View Application Status</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnPrimaryText}>Back To Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // B. FAILED PAGE
  if (paymentStatus === 'FAILED') {
    return (
      <View style={[styles.container, styles.failedContainer]}>
        <View style={styles.failedCheckmarkCircle}>
          <Icon name="close-circle" size={80} color="#FF1744" />
        </View>

        <Text style={styles.failedTitle}>❌ Payment Failed</Text>
        <Text style={styles.failedDesc}>We could not process your payment.</Text>

        <View style={styles.failedDetailCard}>
          <Text style={styles.failedDetailTitle}>Possible Reasons:</Text>
          <Text style={styles.failedReasonText}>• {failedReason || 'Bank declined transaction'}</Text>
          <Text style={styles.failedReasonText}>• Insufficient funds or card limits exceeded</Text>
          <Text style={styles.failedReasonText}>• Invalid card CVV or expiry input</Text>
          <Text style={styles.failedReasonText}>• Temp network error between banks</Text>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.primaryFailedBtn} onPress={handleTryAgain}>
            <Text style={styles.btnPrimaryText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleChangeCard}>
            <Text style={styles.btnText}>Change Card</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={() => Alert.alert('Support', 'Connecting with Merchant Payment Hotline...')}>
            <Icon name="headphones" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // C. FORM PAYMENTS STATE
  const last4 = cardNumber.replace(/\s/g, '').slice(-4);
  const maskedCardNumber = cardNumber.replace(/\s/g, '').length > 4 
    ? cardNumber.replace(/\s/g, '').slice(0, 4) + ' •••• •••• ' + last4 
    : cardNumber;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.wrapper}>
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        
        {/* TOP COMPLIANCE BADGE */}
        <View style={styles.complianceBadge}>
          <Icon name="shield-lock" size={16} color="#00E676" />
          <Text style={styles.complianceText}>SECURE 256-BIT SSL ENCRYPTED GATEWAY</Text>
        </View>

        {/* VISA CARD MOCKUP VIEW */}
        <View style={styles.visaCardContainer}>
          <View style={styles.visaCardHeader}>
            <Text style={styles.visaCardTitle}>VISA PLATINUM</Text>
            <Icon name="visa" size={40} color="#FFF" />
          </View>
          
          <Icon name="chip" size={36} color="#FFD700" style={styles.goldChip} />
          
          <Text style={styles.visaNumber}>
            {maskedCardNumber || '4123 4567 8901 2345'}
          </Text>

          <View style={styles.visaCardFooter}>
            <View>
              <Text style={styles.cardLabel}>CARD HOLDER</Text>
              <Text style={styles.cardVal}>{cardHolder.toUpperCase() || 'YOUR NAME HERE'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>EXPIRE END</Text>
              <Text style={styles.cardVal}>{expiryDate || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        {/* AMOUNT CARD BAR */}
        <View style={styles.amountBar}>
          <Text style={styles.amountLabel}>Total Due Payment Amount:</Text>
          <Text style={styles.amountVal}>LKR {amount.toLocaleString()}.00</Text>
        </View>

        {/* INPUT FORM FIELDS */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Secure Cardholder Profile</Text>

          {/* Holder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CARD HOLDER NAME</Text>
            <View style={[styles.inputContainer, validationErrors.cardHolder && styles.inputError]}>
              <Icon name="account" size={20} color="#AAAAAA" />
              <TextInput
                value={cardHolder}
                onChangeText={(txt) => {
                  setCardHolder(txt);
                  if (validationErrors.cardHolder) setValidationErrors(p => ({ ...p, cardHolder: null }));
                }}
                placeholder="As printed on front of card"
                placeholderTextColor="#666666"
                style={styles.textInput}
                autoCapitalize="characters"
              />
            </View>
            {validationErrors.cardHolder && <Text style={styles.errorVal}>{validationErrors.cardHolder}</Text>}
          </View>

          {/* Visa card number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>VISA CARD NUMBER (Only Visa accepted)</Text>
            <View style={[styles.inputContainer, validationErrors.cardNumber && styles.inputError]}>
              <Icon name="credit-card" size={20} color="#AAAAAA" />
              <TextInput
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="4123 4567 8901 2345"
                placeholderTextColor="#666666"
                keyboardType="numeric"
                style={styles.textInput}
              />
            </View>
            {validationErrors.cardNumber && <Text style={styles.errorVal}>{validationErrors.cardNumber}</Text>}
          </View>

          <View style={styles.row}>
            {/* Expiry Date */}
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>EXPIRY DATE</Text>
              <View style={[styles.inputContainer, validationErrors.expiryDate && styles.inputError]}>
                <Icon name="calendar-month" size={20} color="#AAAAAA" />
                <TextInput
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  placeholder="MM/YY"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
              {validationErrors.expiryDate && <Text style={styles.errorVal}>{validationErrors.expiryDate}</Text>}
            </View>

            {/* CVV */}
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>CVV CODE</Text>
              <View style={[styles.inputContainer, validationErrors.cvv && styles.inputError]}>
                <Icon name="lock-question" size={20} color="#AAAAAA" />
                <TextInput
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="123"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  secureTextEntry={true}
                  style={styles.textInput}
                />
              </View>
              {validationErrors.cvv && <Text style={styles.errorVal}>{validationErrors.cvv}</Text>}
            </View>
          </View>

          {/* Billing Address (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>BILLING ADDRESS (OPTIONAL)</Text>
            <View style={styles.inputContainer}>
              <Icon name="map-marker" size={20} color="#AAAAAA" />
              <TextInput
                value={billingAddress}
                onChangeText={setBillingAddress}
                placeholder="e.g. 104 Galle Rd, Colombo 03"
                placeholderTextColor="#666666"
                style={styles.textInput}
              />
            </View>
          </View>
        </View>

        {/* PAY ACTION BUTTON */}
        <TouchableOpacity style={styles.submitPayBtn} onPress={processVisaPayment}>
          <Icon name="lock" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnPrimaryText}>Securely Pay LKR {amount.toLocaleString()}</Text>
        </TouchableOpacity>

        {/* FOOTER GATEWAY DISCLAIMER */}
        <Text style={styles.pciDisclaimer}>
          By tapping 'Securely Pay' you verify authentication credentials and permit Visa verification flow protocols. 
          Your full card details are encrypted end-to-end and are never saved on our databases.
        </Text>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1E1233', // Premium Dark Purple Background
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 500,
  },
  container: {
    flex: 1,
    width: '100%',
    padding: 24,
    backgroundColor: '#1E1233',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  loadingStage: {
    color: '#00E676',
    fontSize: 14,
    marginTop: 8,
  },
  loadingFooter: {
    color: '#8A819C',
    fontSize: 11,
    marginTop: 30,
    textAlign: 'center',
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  complianceText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  visaCardContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#351261',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  visaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visaCardTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  goldChip: {
    marginTop: 10,
  },
  visaNumber: {
    color: '#FFF',
    fontSize: 19,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 2,
    marginTop: 16,
  },
  visaCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 8,
    letterSpacing: 1,
  },
  cardVal: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 2,
  },
  amountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2E1C4D',
    padding: 16,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    marginBottom: 16,
  },
  amountLabel: {
    color: '#C6BFCF',
    fontSize: 12,
  },
  amountVal: {
    color: '#FFEA00',
    fontSize: 16,
    fontWeight: 'black',
  },
  formCard: {
    backgroundColor: '#2E1C4D',
    borderRadius: 16,
    padding: 18,
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    marginBottom: 20,
  },
  formTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#A197B0',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1233',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    height: 48,
  },
  inputError: {
    borderColor: '#FF1744',
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    marginLeft: 8,
  },
  errorVal: {
    color: '#FF1744',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitPayBtn: {
    flexDirection: 'row',
    backgroundColor: '#6200EE',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  pciDisclaimer: {
    color: '#8A819C',
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 16,
    paddingHorizontal: 10,
  },
  // Success styles
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#110921',
  },
  checkmarkCircle: {
    marginBottom: 20,
  },
  successTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  successSub: {
    color: '#00E676',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  successDesc: {
    color: '#9E94B3',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#1D1231',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginTop: 24,
  },
  receiptHeader: {
    color: '#A59BB5',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
  },
  receiptLabel: {
    color: '#A59BB5',
    fontSize: 12,
  },
  receiptValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  boldValue: {
    fontSize: 14,
    color: '#00E676',
  },
  statusSuccess: {
    color: '#00E676',
  },
  btnGroup: {
    width: '100%',
    marginTop: 24,
  },
  secondaryBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#00E676',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },

  // Failed state styles
  failedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C0E1F',
  },
  failedCheckmarkCircle: {
    marginBottom: 20,
  },
  failedTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  failedDesc: {
    color: '#AFA4BA',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  failedDetailCard: {
    width: '100%',
    backgroundColor: '#2A142D',
    borderRadius: 14,
    padding: 16,
    borderColor: 'rgba(255,23,68,0.15)',
    borderWidth: 1,
    marginTop: 20,
  },
  failedDetailTitle: {
    color: '#FF1744',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  failedReasonText: {
    color: '#E0D8E6',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  primaryFailedBtn: {
    height: 48,
    backgroundColor: '#FF1744',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  outlineBtn: {
    flexDirection: 'row',
    height: 48,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});
