import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Animated
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { ArrowLeft, MapPin, Phone, ShieldCheck, Ticket, Truck, CreditCard, CheckCircle, Package, Clock, User } from 'lucide-react-native';

export const CheckoutScreen: React.FC = () => {
  const { 
    isDarkMode, billingAddress, setBillingAddress, billingCity, setBillingCity,
    billingPhone, setBillingPhone, enteredPromoCode, setEnteredPromoCode, promoMessage,
    selectedCourier, setSelectedCourier, getGrandTotal, getCartTotal, getTaxAmount, 
    activePromoDiscount, validationError, clearValidationError, validateAndProcessCheckout, 
    navigateTo, currentUser,
  } = useAppContext();

  const { contentWidth } = useDimensions();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'visa'>('cod');
  const [orderPlaced, setOrderPlaced] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successScale] = useState(new Animated.Value(0.3));
  // Local card preview fields (actual entry is in VisaPaymentScreen)
  const [paymentCardNo, setPaymentCardNo] = useState('');
  const [paymentCardExpiry, setPaymentCardExpiry] = useState('');
  const [paymentCardCvv, setPaymentCardCvv] = useState('');

  const colors = isDarkMode ? {
    background: '#0C0717',
    surface: '#160F2B',
    surfaceVariant: '#22183D',
    border: '#3F2D6B',
    primary: '#C78DFF',
    secondary: '#8E24AA',
    text: '#FFFFFF',
    subText: '#B0A2C9',
    error: '#FF1744',
    success: '#00E676',
  } : {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    secondary: '#6200EA',
    text: '#120024',
    subText: '#6D5C80',
    error: '#D50000',
    success: '#2E7D32',
  };

  const deliveryFee = selectedCourier === 'std' ? 250 : selectedCourier === 'exp' ? 500 : 950;
  const subtotal = getCartTotal();
  const tax = getTaxAmount();
  const grandTotal = getGrandTotal();

  const handlePlaceOrder = async () => {
    clearValidationError();
    if (paymentMethod === 'visa') {
      if (!billingAddress.trim() || billingAddress.trim().length < 8) {
        alert('Please enter your Street Delivery Address (min 8 chars).');
        return;
      }
      if (!billingCity.trim()) {
        alert('Please enter your Province/City.');
        return;
      }
      navigateTo('VISA_PAYMENT');
    } else {
      // COD â€” show in-screen success
      setIsProcessing(true);
      try {
        const order = await validateAndProcessCheckout('Cash on Delivery');
        if (order) {
          setOrderPlaced(order);
          Animated.spring(successScale, {
            toValue: 1, tension: 40, friction: 6, useNativeDriver: true,
          }).start();
        }
      } catch (err: any) {
        alert(err.message || 'An error occurred during checkout.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // â”€â”€â”€ ORDER SUCCESS VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (orderPlaced) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.container, styles.successContainer, { maxWidth: contentWidth }]}>
          <Animated.View style={{ transform: [{ scale: successScale }], marginBottom: 8 }}>
            <CheckCircle size={72} color={colors.success} />
          </Animated.View>

          <Text style={[styles.successTitle, { color: colors.text }]}>Order Placed! ðŸŽ‰</Text>
          <Text style={[styles.successSub, { color: colors.success }]}>Payment Confirmed</Text>
          <Text style={[styles.successDesc, { color: colors.subText }]}>
            Your order has been placed successfully. The courier will collect and dispatch shortly.
          </Text>

          {/* RECEIPT */}
          <View style={[styles.receiptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.receiptHeader, { color: colors.subText }]}>ðŸ“„ ORDER RECEIPT</Text>

            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 12 }}>Order ID</Text>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>#{orderPlaced.id}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 12 }}>Customer</Text>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>{currentUser?.name}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 12 }}>Payment Method</Text>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>ðŸ’µ Cash on Delivery</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 12 }}>Delivery Address</Text>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: 'bold', maxWidth: '55%', textAlign: 'right' }}>
                {billingAddress}, {billingCity}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={{ color: colors.subText, fontSize: 12 }}>Courier Partner</Text>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>
                {selectedCourier === 'std' ? 'ðŸ“¦ Standard (2-3 Days)' : selectedCourier === 'exp' ? 'âš¡ Express (24h)' : 'ðŸš€ Same-Day'}
              </Text>
            </View>
            <View style={[styles.receiptRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: 'bold' }}>Total Paid</Text>
              <Text style={{ color: colors.success, fontSize: 16, fontWeight: 'bold' }}>
                LKR {orderPlaced.totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={{ width: '100%', gap: 10 }}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigateTo('PROFILE')}
            >
              <Package size={16} color={colors.background} />
              <Text style={[styles.actionBtnText, { color: colors.background }]}>View Payment History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => navigateTo('MAP')}
            >
              <Clock size={16} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Live Courier Tracking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => navigateTo('HOME')}
            >
              <Text style={[styles.actionBtnText, { color: colors.text }]}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { maxWidth: contentWidth }]}>
        
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigateTo('CART')} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Basket</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout Details</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* VALIDATION ERROR ALERTS */}
        {validationError && (
          <View style={[styles.errorCard, { borderColor: colors.error }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>âš ï¸ {validationError}</Text>
          </View>
        )}

        {/* 1. CUSTOMER DETAILS */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <User size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Details</Text>
          </View>
          <View style={[styles.infoBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>{currentUser?.name}</Text>
            <Text style={{ color: colors.subText, fontSize: 11 }}>{currentUser?.email}</Text>
            <Text style={{ color: colors.subText, fontSize: 11 }}>{currentUser?.phoneNumber || 'No phone on file'}</Text>
          </View>
        </View>

        {/* 2. DELIVERY ADDRESS FORM */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>STREET ADDRESS</Text>
            <TextInput
              style={[styles.inputBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 142 Galle Road, Colombo 03"
              placeholderTextColor={colors.subText}
              value={billingAddress}
              onChangeText={setBillingAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>CITY / PROVINCE</Text>
            <TextInput
              style={[styles.inputBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Western Province / Colombo"
              placeholderTextColor={colors.subText}
              value={billingCity}
              onChangeText={setBillingCity}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.subText }]}>CONTACT PHONE NUMBER</Text>
            <View style={styles.phoneInputRow}>
              <Phone size={14} color={colors.subText} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.inputBox, { flex: 1, backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. +94 77 123 4567"
                placeholderTextColor={colors.subText}
                keyboardType="phone-pad"
                value={billingPhone}
                onChangeText={setBillingPhone}
              />
            </View>
          </View>
        </View>

        {/* 3. SHIPPING METHODS */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Truck size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Carrier Partner</Text>
          </View>

          <View style={styles.shippingGrid}>
            {[
              { id: 'std', name: 'Standard Courier', desc: 'Arrives in 2-3 Days', price: 250 },
              { id: 'exp', name: 'Express Speed', desc: 'Arrives in 24 Hours', price: 500 },
              { id: 'sday', name: 'Same-Day Dispatch', desc: 'Arrives in 4 Hours', price: 950 },
            ].map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.shippingCard,
                  { backgroundColor: colors.surfaceVariant, borderColor: selectedCourier === method.id ? colors.primary : colors.border }
                ]}
                onPress={() => setSelectedCourier(method.id)}
              >
                <Text style={[styles.shippingName, { color: colors.text }]}>{method.name}</Text>
                <Text style={[styles.shippingDesc, { color: colors.subText }]}>{method.desc}</Text>
                <Text style={[styles.shippingPrice, { color: colors.primary }]}>LKR {method.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. PROMO CODE */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ticket size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo Discount Code</Text>
          </View>

          <View style={styles.promoRow}>
            <TextInput
              style={[styles.promoBox, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. OFFERLANKA"
              placeholderTextColor={colors.subText}
              autoCapitalize="characters"
              value={enteredPromoCode}
              onChangeText={setEnteredPromoCode}
            />
          </View>
          
          {promoMessage ? (
            <Text style={styles.promoSuccessText}>âœ… {promoMessage}</Text>
          ) : (
            <Text style={[styles.promoHelpText, { color: colors.subText }]}>
              Tips: Use <Text style={{fontWeight: 'bold', color: colors.primary}}>OFFERLANKA</Text> for 15% off or <Text style={{fontWeight: 'bold', color: colors.primary}}>FREESHIP</Text> for free shipping!
            </Text>
          )}
        </View>

        {/* 5. PAYMENT METHOD */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          </View>

          <View style={styles.paymentMethodRow}>
            <TouchableOpacity 
              style={[
                styles.paymentMethodBtn, 
                { backgroundColor: colors.surfaceVariant, borderColor: paymentMethod === 'cod' ? colors.primary : colors.border }
              ]}
              onPress={() => setPaymentMethod('cod')}
            >
              <Text style={[styles.paymentMethodText, { color: colors.text }]}>ðŸ’µ Cash on Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.paymentMethodBtn, 
                { backgroundColor: colors.surfaceVariant, borderColor: paymentMethod === 'visa' ? colors.primary : colors.border }
              ]}
              onPress={() => setPaymentMethod('visa')}
            >
              <Text style={[styles.paymentMethodText, { color: colors.text }]}>ðŸ’³ Visa / Mastercard</Text>
            </TouchableOpacity>
          </View>

          {/* Visa mini card fields shown inline */}
          {paymentMethod === 'visa' && (
            <View style={[styles.visaInlineBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <Text style={{ color: colors.subText, fontSize: 9, fontWeight: 'bold', marginBottom: 8 }}>
                ðŸ”’ CARD DETAILS (Proceed to secure gateway)
              </Text>
              <TextInput
                style={[styles.inputBox, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginBottom: 8 }]}
                placeholder="Card Holder Name"
                placeholderTextColor={colors.subText}
                autoCapitalize="characters"
                value={paymentCardNo}
                onChangeText={setPaymentCardNo}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[styles.inputBox, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.subText}
                  keyboardType="numeric"
                  value={paymentCardExpiry}
                  onChangeText={setPaymentCardExpiry}
                />
                <TextInput
                  style={[styles.inputBox, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="CVV"
                  placeholderTextColor={colors.subText}
                  keyboardType="numeric"
                  secureTextEntry
                  value={paymentCardCvv}
                  onChangeText={setPaymentCardCvv}
                />
              </View>
              <Text style={{ color: colors.subText, fontSize: 9, marginTop: 6 }}>
                â†ª Clicking "Proceed" takes you to the full secure Visa gateway screen
              </Text>
            </View>
          )}
        </View>

        {/* ORDER BREAKDOWN */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.subText, fontSize: 11 }}>Subtotal</Text>
            <Text style={{ color: colors.text, fontSize: 11 }}>LKR {subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.subText, fontSize: 11 }}>VAT Taxes (8%)</Text>
            <Text style={{ color: colors.text, fontSize: 11 }}>LKR {tax.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: colors.subText, fontSize: 11 }}>Delivery Partner Fee</Text>
            <Text style={{ color: colors.text, fontSize: 11 }}>LKR {deliveryFee.toLocaleString()}</Text>
          </View>
          {activePromoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={{ color: '#00C853', fontSize: 11, fontWeight: 'bold' }}>Promo Discount</Text>
              <Text style={{ color: '#00C853', fontSize: 11, fontWeight: 'bold' }}>- LKR {activePromoDiscount.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Due Payment</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>LKR {grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: isProcessing ? colors.subText : colors.primary }]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <ShieldCheck size={18} color={colors.background} />
          <Text style={[styles.submitBtnText, { color: colors.background }]}>
            {isProcessing ? 'Processing...' : paymentMethod === 'visa' ? 'Proceed to Secure Visa Gateway' : 'Place Order (Cash on Delivery)'}
          </Text>
        </TouchableOpacity>

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
  successContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  successSub: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  successDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  receiptCard: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginVertical: 16,
  },
  receiptHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  errorCard: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 23, 68, 0.08)',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 3,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  inputBox: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shippingCard: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 2,
  },
  shippingName: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  shippingDesc: {
    fontSize: 8,
  },
  shippingPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoBox: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  promoHelpText: {
    fontSize: 8.5,
    lineHeight: 12,
  },
  promoSuccessText: {
    fontSize: 9,
    color: '#00C853',
    fontWeight: 'bold',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  visaInlineBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  submitBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '900',
  }
});

export default CheckoutScreen;
