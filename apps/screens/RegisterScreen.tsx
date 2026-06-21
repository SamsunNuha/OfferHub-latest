import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Mail, Phone, MapPin, Lock, Eye, EyeOff, User, Store, Shield, CheckCircle, ChevronDown } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase'; // Adjust this import to match your project

const theme = {
  primary: '#6C3BFF',
  secondary: '#8B5CF6',
  background: '#F8F6FF',
  card: '#FFFFFF',
  border: '#E9E2FF',
  text: '#1E1B4B',
  error: '#EF4444',
  success: '#10B981',
  placeholder: '#9CA3AF',
};

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", 
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", 
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", 
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", 
  "Trincomalee", "Vavuniya"
];

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string()
    .matches(/^[0-9]{9}$/, 'Enter exactly 9 digits after +94')
    .required('Phone is required'),
  district: yup.string().required('District is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9!@#$%^&*()]/, 'Must contain at least one number or symbol')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type FormData = yup.InferType<typeof schema>;
type AccountType = 'user' | 'merchant' | 'admin';

export default function RegisterScreen({ navigation }: any) {
  const [accountType, setAccountType] = useState<AccountType>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { district: '' },
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');

  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()]/.test(passwordValue);

  const calculateStrength = () => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumberOrSymbol) score++;
    return score;
  };

  const strengthScore = calculateStrength();

  const handleRegister = async (data: FormData) => {
    setLoading(true);
    setFirebaseError('');
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Save additional data to Firestore
      const phoneWithCode = `+94${data.phone}`;
      
      await setDoc(doc(db, 'users', user.uid), {
        fullName: data.fullName,
        email: data.email,
        phone: phoneWithCode,
        district: data.district,
        role: accountType,
        createdAt: new Date().toISOString(),
      });

      // Navigate to home or show success message
      if (navigation && navigation.navigate) {
         navigation.navigate('Home');
      }

    } catch (error: any) {
      setFirebaseError(error.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const renderAccountTypeCard = (type: AccountType, IconComp: any, title: string, desc: string) => {
    const isSelected = accountType === type;
    
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setAccountType(type)}
        style={[styles.accountCard, isSelected && styles.accountCardSelected]}
      >
        {isSelected ? (
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
          />
        ) : null}
        
        <View style={styles.accountCardContent}>
          <View style={styles.cardHeaderRow}>
            <IconComp size={24} color={isSelected ? '#fff' : theme.primary} />
            {isSelected && <CheckCircle size={20} color="#fff" />}
          </View>
          <Text style={[styles.cardTitle, { color: isSelected ? '#fff' : theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.cardDesc, { color: isSelected ? 'rgba(255,255,255,0.8)' : theme.placeholder }]}>
            {desc}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={styles.iconCircle}
            >
              <UserPlus color="#fff" size={32} />
            </LinearGradient>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Join <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Offer Lanka</Text> and discover exclusive offers</Text>
          </View>

          {firebaseError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{firebaseError}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.form}>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                <User color={theme.primary} size={20} style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor={theme.placeholder}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Mail color={theme.primary} size={20} style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email address"
                      placeholderTextColor={theme.placeholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Phone color={theme.primary} size={20} style={styles.inputIcon} />
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>🇱🇰 +94</Text>
                  <ChevronDown color={theme.placeholder} size={16} />
                </View>
                <View style={styles.divider} />
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="7X XXX XXXX"
                      placeholderTextColor={theme.placeholder}
                      keyboardType="phone-pad"
                      maxLength={9}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
            </View>

            {/* District Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SELECT DISTRICT (SRI LANKA)</Text>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => setShowDistrictModal(true)}
                style={[styles.inputContainer, errors.district && styles.inputError]}
              >
                <MapPin color={theme.primary} size={20} style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="district"
                  render={({ field: { value } }) => (
                    <Text style={[styles.input, { marginTop: Platform.OS === 'ios' ? 0 : 3 }, !value && { color: theme.placeholder }]}>
                      {value || "Select your district"}
                    </Text>
                  )}
                />
                <ChevronDown color={theme.placeholder} size={20} style={{ marginRight: 16 }} />
              </TouchableOpacity>
              {errors.district && <Text style={styles.errorText}>{errors.district.message}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Lock color={theme.primary} size={20} style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={theme.placeholder}
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff color={theme.primary} size={20} /> : <Eye color={theme.primary} size={20} />}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
              
              {/* Password Strength */}
              {passwordValue.length > 0 && (
                <View style={styles.strengthContainer}>
                  <Text style={styles.strengthLabel}>Password strength</Text>
                  <View style={styles.strengthBars}>
                    <View style={[styles.strengthBar, strengthScore >= 1 && { backgroundColor: theme.primary }]} />
                    <View style={[styles.strengthBar, strengthScore >= 2 && { backgroundColor: theme.primary }]} />
                    <View style={[styles.strengthBar, strengthScore >= 3 && { backgroundColor: theme.primary }]} />
                  </View>
                  <View style={styles.strengthChecks}>
                    <View style={styles.checkItem}>
                      <CheckCircle size={14} color={hasMinLength ? theme.primary : theme.placeholder} />
                      <Text style={[styles.checkText, hasMinLength && { color: theme.text }]}>At least 8 characters</Text>
                    </View>
                    <View style={styles.checkItem}>
                      <CheckCircle size={14} color={hasUppercase ? theme.primary : theme.placeholder} />
                      <Text style={[styles.checkText, hasUppercase && { color: theme.text }]}>One uppercase letter</Text>
                    </View>
                    <View style={styles.checkItem}>
                      <CheckCircle size={14} color={hasNumberOrSymbol ? theme.primary : theme.placeholder} />
                      <Text style={[styles.checkText, hasNumberOrSymbol && { color: theme.text }]}>One number or symbol</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Lock color={theme.primary} size={20} style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor={theme.placeholder}
                      secureTextEntry={!showConfirmPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  {showConfirmPassword ? <EyeOff color={theme.primary} size={20} /> : <Eye color={theme.primary} size={20} />}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
            </View>

            {/* Account Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ACCOUNT PORTAL TYPE</Text>
              <View style={styles.cardsRow}>
                {renderAccountTypeCard('user', User, 'User', 'I want to explore offers & shop')}
                {renderAccountTypeCard('merchant', Store, 'Merchant', 'I want to promote my business')}
                {renderAccountTypeCard('admin', Shield, 'Admin', 'I want to manage the platform')}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleSubmit(handleRegister)}
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <UserPlus color="#fff" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Create Account</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.footerLink}>Sign In</Text>
              </Text>
              <View style={styles.securityBadge}>
                <Shield color={theme.primary} size={16} />
                <Text style={styles.securityText}>Your information is secure with us</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* District Selection Modal */}
      <Modal
        visible={showDistrictModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select District</Text>
            <FlatList
              data={districts}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setValue('district', item, { shouldValidate: true });
                    setShowDistrictModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowDistrictModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.placeholder,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorBannerText: {
    color: theme.error,
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: theme.error,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: theme.text,
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.border,
    marginHorizontal: 12,
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    color: theme.error,
    fontSize: 12,
    marginTop: -4,
  },
  strengthContainer: {
    marginTop: 4,
    gap: 8,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
  },
  strengthChecks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    fontSize: 12,
    color: theme.placeholder,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  accountCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 120,
    overflow: 'hidden',
  },
  accountCardSelected: {
    borderColor: 'transparent',
  },
  accountCardContent: {
    padding: 12,
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  footerText: {
    fontSize: 14,
    color: theme.text,
  },
  footerLink: {
    color: theme.primary,
    fontWeight: '700',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: theme.placeholder,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalItemText: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
  },
  modalCloseText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.error,
  },
});
