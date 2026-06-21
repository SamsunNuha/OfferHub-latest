import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, 
  ScrollView, ActivityIndicator, FlatList 
} from 'react-native';
import { ThemeColors, Typography } from '../shared/theme';
import { DISTRICT_LIST } from '../utils/districts';

interface DialogProps {
  visible: boolean;
  colors: ThemeColors;
  onDismiss: () => void;
}

// 1. SECURE AUTH DIALOG
interface AuthDialogProps extends DialogProps {
  reason: string;
  onConfirm: () => void;
}
export const AuthRequiredDialog: React.FC<AuthDialogProps> = ({ visible, colors, reason, onDismiss, onConfirm }) => {
  const getReasonText = (res: string) => {
    switch (res) {
      case "cart": return "To add products to your direct basket and compile local checkouts, you must have a secure account.";
      case "favorites": return "To track your favorite items and deals, you must be securely signed in.";
      case "checkout": return "To proceed with secure payment gateways and place orders, you must log in.";
      case "profile": return "To view your completed purchase history and earn islandwide loyalty points, you must sign in.";
      case "loyalty": return "To view and claim coupon codes and redeem active promotions, you must sign in.";
      default: return "To complete this action and access restricted premium e-commerce services, please sign in or register.";
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBg}>
        <View style={[styles.dialogCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.dialogTitle, { color: colors.text }]}>🔐 Secure Login Required</Text>
          <Text style={[styles.dialogBodyText, { color: colors.subText }]}>{getReasonText(reason)}</Text>
          <Text style={styles.dialogFooterInfo}>Guest users can browse all products, details, and flyers freely without logging in.</Text>
          <View style={styles.dialogBtnGroup}>
            <TouchableOpacity style={[styles.dialogBtn, { backgroundColor: 'transparent' }]} onPress={onDismiss}>
              <Text style={{ color: colors.subText, fontWeight: 'bold' }}>Continue Browsing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dialogBtn, { backgroundColor: colors.primary }]} onPress={onConfirm}>
              <Text style={{ color: colors.background, fontWeight: 'bold' }}>Sign In Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 2. DISTRICT SELECTOR DIALOG
interface DistrictProps extends DialogProps {
  onSelect: (district: string) => void;
}
export const DistrictSelectorDialog: React.FC<DistrictProps> = ({ visible, colors, onDismiss, onSelect }) => {
  const [search, setSearch] = useState('');
  const filtered = DISTRICT_LIST.filter(d => d.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBg}>
        <View style={[styles.dialogCard, { backgroundColor: colors.surface, borderColor: colors.border, maxHeight: '70%', width: '90%' }]}>
          <Text style={[styles.dialogTitle, { color: colors.text }]}>📍 Select Sri Lankan District</Text>
          
          <TextInput
            style={[styles.searchInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search District..."
            placeholderTextColor={colors.subText}
          />

          <FlatList
            data={filtered}
            keyExtractor={item => item}
            style={{ width: '100%', marginVertical: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.districtRow, { borderBottomColor: colors.border }]} 
                onPress={() => {
                  onSelect(item);
                  onDismiss();
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14 }}>📍 {item}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={[styles.dialogBtn, { alignSelf: 'flex-end', backgroundColor: colors.border }]} onPress={onDismiss}>
            <Text style={{ color: colors.text }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// 3. SMS OTP VERIFICATION DIALOG
interface OtpProps extends DialogProps {
  phoneNumber: string;
  onVerifySuccess: () => void;
}
export const SmsOtpDialog: React.FC<OtpProps> = ({ visible, colors, phoneNumber, onDismiss, onVerifySuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = () => {
    if (code === '123456') {
      setError(null);
      setCode('');
      onVerifySuccess();
    } else {
      setError("Incorrect code. Please enter '123456' to pass simulated SMS verification.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBg}>
        <View style={[styles.dialogCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.dialogTitle, { color: colors.text }]}>🔐 SMS OTP Verification</Text>
          <Text style={[styles.dialogBodyText, { color: colors.subText }]}>
            A high-security, 6-digit verification code has been dispatched to {phoneNumber || "your cellular device"} via SMS Gateway.
          </Text>
          
          <TextInput
            style={[styles.otpInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
            value={code}
            onChangeText={t => {
              setCode(t.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            placeholder="123456"
            placeholderTextColor={colors.subText}
            keyboardType="number-pad"
            maxLength={6}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={{ alignSelf: 'flex-end', marginVertical: 6 }} onPress={() => setCode('123456')}>
            <Text style={{ color: colors.primary, fontSize: 11 }}>Auto-fill OTP (123456)</Text>
          </TouchableOpacity>

          <View style={styles.dialogBtnGroup}>
            <TouchableOpacity style={[styles.dialogBtn, { backgroundColor: 'transparent' }]} onPress={onDismiss}>
              <Text style={{ color: colors.subText }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dialogBtn, { backgroundColor: colors.primary }]} onPress={handleVerify}>
              <Text style={{ color: colors.background, fontWeight: 'bold' }}>Verify & Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogCard: {
    width: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  dialogBodyText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  dialogFooterInfo: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogBtnGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 10,
  },
  dialogBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  districtRow: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  otpInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 8,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  errorText: {
    color: '#D50000',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
  }
});
