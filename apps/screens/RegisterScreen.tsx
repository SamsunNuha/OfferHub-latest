import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Modal, FlatList, ImageBackground, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  UserPlus, Mail, Phone, MapPin, Lock, Eye, EyeOff,
  User, Store, Shield, CheckCircle, ChevronDown,
  Globe, Sun, Moon, ShoppingBag,
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useAppContext } from '../shared/AppContext';

const districts = [
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle",
  "Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle",
  "Kilinochchi","Kurunegala","Mannar","Matale","Matara","Moneragala",
  "Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura",
  "Trincomalee","Vavuniya",
];

const schema = yup.object().shape({
  fullName: yup.string()
    .matches(/^[A-Za-z ]+$/, 'Only letters and spaces allowed')
    .required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string()
    .matches(/^\d{9}$/, 'Enter exactly 9 digits after +94')
    .required('Phone is required'),
  district: yup.string().required('District is required'),
  password: yup.string()
    .min(6, 'Min 6 characters')
    .matches(/[A-Z]/, 'Need uppercase letter')
    .matches(/[0-9!@#$%^&*()]/, 'Need number or symbol')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password'),
});

type FormData = yup.InferType<typeof schema>;
type AccountType = 'user' | 'merchant' | 'admin';

export default function RegisterScreen({ navigation }: any) {
  const { navigateTo, isDarkMode, toggleDarkMode, register, registerRole } = useAppContext();
  const { width: SCREEN_W } = useWindowDimensions();
  const IS_DESKTOP = Platform.OS === 'web' && SCREEN_W > 768;

  const C = {
    cardBg: isDarkMode ? 'rgba(13,6,30,0.82)' : 'rgba(255,255,255,0.95)',
    cardBorder: isDarkMode ? 'rgba(108,59,255,0.3)' : 'rgba(108,59,255,0.2)',
    inputBg: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(108,59,255,0.04)',
    inputBorder: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(108,59,255,0.3)',
    text: isDarkMode ? '#FFFFFF' : '#120024',
    sub: isDarkMode ? '#8E86A8' : '#6D5C80',
    accent: '#A85FFF',
    gradient: ['#7C4DFF', '#C77DFF'] as [string, string],
    navBg: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(108,59,255,0.05)',
    navBorder: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(108,59,255,0.15)',
    error: '#FF5252',
    success: '#00E676',
  };

  const [accountType, setAccountType] = useState<AccountType>(
    registerRole === 'MERCHANT' ? 'merchant' : registerRole === 'ADMIN' ? 'admin' : 'user'
  );

  React.useEffect(() => {
    setAccountType(registerRole === 'MERCHANT' ? 'merchant' : registerRole === 'ADMIN' ? 'admin' : 'user');
  }, [registerRole]);
  const [showCpw, setShowCpw] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<FormData>({
    resolver: yupResolver(schema as any),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      district: '',
      password: '',
      confirmPassword: '',
    },
  });

  const pw = watch('password', '');
  const hasLen = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasSymbol = /[0-9!@#$%^&*()]/.test(pw);
  const strength = [hasLen, hasUpper, hasSymbol].filter(Boolean).length;
  const strengthColor = ['#FF5252', '#FFA726', '#00E676'][strength - 1] ?? '#FF5252';

  const handleRegister = async (data: FormData) => {
    setLoading(true);
    setFirebaseError('');
    setSuccessMsg('');
    const mappedRole = accountType === 'user' ? 'NORMAL' : accountType === 'merchant' ? 'MERCHANT' : 'ADMIN';
    try {
      const res = await register(
        data.fullName,
        data.email,
        mappedRole,
        data.password,
        data.district,
        `+94${data.phone}`
      );
      if (res.success) {
        setSuccessMsg(res.message || 'Account created successfully!');
      } else {
        setFirebaseError(res.message || 'Registration failed.');
      }
    } catch (e: any) {
      setFirebaseError(e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, icon: Icon, children, error,
  }: { label: string; icon: any; children: React.ReactNode; error?: string }) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: C.text }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor: C.inputBorder, backgroundColor: C.inputBg }]}>
        <Icon size={17} color={C.sub} />
        {children}
      </View>
      {error ? <Text style={[styles.errorText, { color: C.error }]}>{error}</Text> : null}
    </View>
  );

  const accountTypes: { type: AccountType; Icon: any; label: string; desc: string }[] = [
    { type: 'user', Icon: User, label: 'Customer', desc: 'Explore & shop' },
    { type: 'merchant', Icon: Store, label: 'Merchant', desc: 'Promote business' },
    { type: 'admin', Icon: Shield, label: 'Admin', desc: 'Manage platform' },
  ];

  return (
    <ImageBackground
        source={require('../assets/city_skyline_bg.png')}
        style={{ flex: 1 }}
        imageStyle={{ opacity: isDarkMode ? 0.8 : 0.2 }}

      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(8,3,20,0.65)' : 'rgba(246,242,255,0.85)' }]} />

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <LinearGradient colors={C.gradient} style={styles.navLogo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <ShoppingBag size={16} color="#fff" />
          </LinearGradient>
          <Text style={styles.navBrandText}>
            <Text style={{ color: C.text }}>OFFER </Text>
            <Text style={{ color: C.accent }}>LANKA</Text>
          </Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={[styles.navPill, { backgroundColor: C.navBg, borderColor: C.navBorder }]}>
            <Globe size={12} color={C.text} />
            <Text style={[styles.navPillText, { color: C.text }]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navIcon, { backgroundColor: C.navBg, borderColor: C.navBorder }]} onPress={toggleDarkMode}>
            {isDarkMode ? <Sun size={15} color={C.accent} /> : <Moon size={15} color={C.accent} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, IS_DESKTOP && styles.scrollDesktop]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* WIDE CARD */}
          <View style={[
            styles.card,
            IS_DESKTOP && styles.cardDesktop,
            { backgroundColor: C.cardBg, borderColor: C.cardBorder },
          ]}>

            {/* Card Header */}
            <View style={styles.cardHeader}>
              <LinearGradient colors={C.gradient} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <UserPlus size={22} color="#fff" />
              </LinearGradient>
              <Text style={[styles.title, { color: C.text }]}>
                Create <Text style={{ color: C.accent }}>Account</Text>
              </Text>
              <Text style={[styles.subtitle, { color: C.sub }]}>
                Join Offer Lanka and discover exclusive offers across Sri Lanka
              </Text>
            <TextInput placeholder="Test input" style={{ borderWidth: 1, marginTop: 10, color: C.text }} />
            </View>

            {/* Banners */}
            {!!firebaseError && (
              <View style={[styles.banner, { backgroundColor: 'rgba(213,0,0,0.12)', borderColor: '#D50000' }]}>
                <Text style={{ color: C.error, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>❌  {firebaseError}</Text>
              </View>
            )}
            {!!successMsg && (
              <View style={[styles.banner, { backgroundColor: 'rgba(0,200,83,0.1)', borderColor: '#00C853' }]}>
                <Text style={{ color: C.success, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>✅  {successMsg}</Text>
              </View>
            )}

            {/* 2-COLUMN GRID */}
            <View style={[styles.grid, IS_DESKTOP && styles.gridDesktop]}>

              {/* LEFT COLUMN */}
              <View style={[styles.col, IS_DESKTOP && styles.colDesktop]}>

                {/* Full Name */}
                <Field label="Full Name" icon={User} error={errors.fullName?.message}>
                  <Controller
                    control={control} name="fullName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, { color: C.text }]}
                        placeholder="Enter your full name"
                        placeholderTextColor={C.sub}
                        onBlur={onBlur}
                        onChangeText={text => onChange(text.replace(/[^A-Za-z ]/g, ''))}
                        value={value || ''}
                        blurOnSubmit={false}
                      />
                    )}
                  />
                </Field>

                {/* Phone */}
                <Field label="Phone Number" icon={Phone} error={errors.phone?.message}>
                  <Text style={[styles.prefix, { color: C.sub }]}>🇱🇰 +94</Text>
                  <View style={[styles.divider, { backgroundColor: C.inputBorder }]} />
                  <Controller
                     control={control} name="phone"
                     render={({ field: { onChange, onBlur, value } }) => (
                       <TextInput
                         style={[styles.input, { color: C.text }]}
                         placeholder="7X XXX XXXX"
                         placeholderTextColor={C.sub}
                         keyboardType="phone-pad"
                         maxLength={9}
                         onBlur={onBlur}
                         onChangeText={text => onChange(text.replace(/[^0-9]/g, '').slice(0,9))}
                         value={value || ''}
                         blurOnSubmit={false}
                       />
                     )}
                   />
                </Field>

                {/* Password */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: C.text }]}>Password</Text>
                  <View style={[styles.inputRow, { borderColor: C.inputBorder, backgroundColor: C.inputBg }]}>
                    <Lock size={17} color={C.sub} />
                    <Controller
                       control={control} name="password"
                       render={({ field: { onChange, onBlur, value } }) => (
                         <TextInput
                           style={[styles.input, { color: C.text }]}
                           placeholder="••••••••••••"
                           placeholderTextColor={C.sub}
                           secureTextEntry={!showPw}
                           onBlur={onBlur}
                           onChangeText={onChange}
                           value={value || ''}
                           blurOnSubmit={false}
                         />
                       )}
                     />
                    <TouchableOpacity onPress={() => setShowPw(v => !v)}>
                      {showPw ? <Eye size={16} color={C.sub} /> : <EyeOff size={16} color={C.sub} />}
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={[styles.errorText, { color: C.error }]}>{errors.password.message}</Text>}
                  {pw.length > 0 && (
                    <View style={{ marginTop: 8, gap: 6 }}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {[0, 1, 2].map(i => (
                          <View key={i} style={[styles.strengthBar, {
                            backgroundColor: i < strength ? strengthColor : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#E9E2FF'),
                          }]} />
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {[{ met: hasLen, label: '8+ chars' }, { met: hasUpper, label: 'Uppercase' }, { met: hasSymbol, label: 'Number/Symbol' }].map(({ met, label }) => (
                          <View key={label} style={styles.checkItem}>
                            <CheckCircle size={11} color={met ? C.accent : C.sub} />
                            <Text style={{ color: met ? C.text : C.sub, fontSize: 10 }}>{label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

              </View>

              {/* RIGHT COLUMN */}
              <View style={[styles.col, IS_DESKTOP && styles.colDesktop]}>

                {/* Email */}
                <Field label="Email Address" icon={Mail} error={errors.email?.message}>
                  <Controller
                     control={control} name="email"
                     render={({ field: { onChange, onBlur, value } }) => (
                       <TextInput
                         style={[styles.input, { color: C.text }]}
                         placeholder="Enter your email address"
                         placeholderTextColor={C.sub}
                         keyboardType="email-address" autoCapitalize="none"
                         onBlur={onBlur}
                         onChangeText={onChange}
                         value={value || ''}
                         blurOnSubmit={false}
                       />
                     )}
                   />
                </Field>

                {/* District */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: C.text }]}>District</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowDistrictModal(true)}
                    style={[styles.inputRow, { borderColor: C.inputBorder, backgroundColor: C.inputBg }]}
                  >
                    <MapPin size={17} color={C.sub} />
                    <Controller
                      control={control} name="district"
                      render={({ field: { value } }) => (
                        <Text style={[styles.input, { color: value ? C.text : C.sub }]}>
                          {value || 'Select your district'}
                        </Text>
                      )}
                    />
                    <ChevronDown size={16} color={C.sub} />
                  </TouchableOpacity>
                  {errors.district && <Text style={[styles.errorText, { color: C.error }]}>{errors.district.message}</Text>}
                </View>

                {/* Confirm Password */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: C.text }]}>Confirm Password</Text>
                  <View style={[styles.inputRow, { borderColor: C.inputBorder, backgroundColor: C.inputBg }]}>
                    <Lock size={17} color={C.sub} />
                    <Controller
                       control={control} name="confirmPassword"
                       render={({ field: { onChange, onBlur, value } }) => (
                         <TextInput
                           style={[styles.input, { color: C.text }]}
                           placeholder="••••••••••••"
                           placeholderTextColor={C.sub}
                           secureTextEntry={!showCpw}
                           onBlur={onBlur}
                           onChangeText={onChange}
                           value={value || ''}
                           blurOnSubmit={false}
                         />
                       )}
                     />
                    <TouchableOpacity onPress={() => setShowCpw(v => !v)}>
                      {showCpw ? <Eye size={16} color={C.sub} /> : <EyeOff size={16} color={C.sub} />}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && <Text style={[styles.errorText, { color: C.error }]}>{errors.confirmPassword.message}</Text>}
                </View>

              </View>
            </View>

            {/* ACCOUNT TYPE — full width */}
            <View style={[styles.fieldGroup, { marginTop: 4 }]}>
              <Text style={[styles.label, { color: C.text }]}>Account Type</Text>
              <View style={styles.roleRow}>
                {accountTypes.map(({ type, Icon, label, desc }) => {
                  const sel = accountType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setAccountType(type)}
                      style={[
                        styles.roleBtn,
                        { borderColor: sel ? C.accent : C.inputBorder },
                        sel && { backgroundColor: 'rgba(168,95,255,0.13)' },
                      ]}
                    >
                      <Icon size={20} color={sel ? C.accent : C.sub} />
                      <Text style={{ color: sel ? C.accent : C.sub, fontSize: 12, fontWeight: '700', marginTop: 6 }}>{label}</Text>
                      <Text style={{ color: C.sub, fontSize: 10, marginTop: 2, textAlign: 'center' }}>{desc}</Text>
                      {sel && <CheckCircle size={12} color={C.accent} style={{ position: 'absolute', top: 8, right: 8 }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SUBMIT */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit(handleRegister)}
              disabled={!isValid || loading}
              style={{ marginTop: 10, backgroundColor: !isValid || loading ? '#888' : C.accent, opacity: !isValid || loading ? 0.6 : 1 }}
            >
              <LinearGradient
                colors={C.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <UserPlus size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>Create Account</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* FOOTER */}
            <TouchableOpacity onPress={() => navigateTo('AUTH')} style={{ marginTop: 18 }}>
              <Text style={[styles.switchText, { color: C.sub }]}>
                Already have an account?{' '}
                <Text style={{ color: C.accent, fontWeight: '700' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.securityBadge}>
              <Shield size={13} color={C.sub} />
              <Text style={{ color: C.sub, fontSize: 11 }}>Your information is secure with us</Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={showDistrictModal} animationType="slide" transparent>
        <View style={styles.modalOverlay} pointerEvents="auto">
          <View style={[styles.modalBox, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF' }]} pointerEvents="auto">
            <Text style={[styles.modalTitle, { color: C.text }]}>Select District</Text>
            <TextInput
              style={[styles.input, { padding: 10, borderWidth: 1, borderColor: C.inputBorder, borderRadius: 8, marginBottom: 10, color: C.text }]}
              placeholder="Search district..."
              placeholderTextColor={C.sub}
              onChangeText={setDistrictSearch}
            />
            <FlatList
              data={districts.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()))}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E9E2FF' }]}
                  onPress={() => { setValue('district', item, { shouldValidate: true }); setShowDistrictModal(false); setDistrictSearch(''); }}
                >
                  <Text style={{ fontSize: 15, color: isDarkMode ? '#FFF' : '#120024', textAlign: 'center' }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: isDarkMode ? 'rgba(168,95,255,0.15)' : '#F6F2FF' }]}
              onPress={() => { setShowDistrictModal(false); setDistrictSearch(''); }}
            >
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#A85FFF', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 18,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLogo: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  navBrandText: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  navPillText: { fontSize: 11, fontWeight: '700' },
  navIcon: { width: 34, height: 34, borderRadius: 9, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  scrollDesktop: { justifyContent: 'center' },

  card: {
    width: '100%', maxWidth: 520,
    borderWidth: 1, borderRadius: 18,
    padding: 28,
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 30, elevation: 10,
    marginVertical: 16,
  },
  cardDesktop: { maxWidth: 940 },

  cardHeader: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 12, textAlign: 'center' },

  banner: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 14 },

  /* 2-column grid */
  grid: { width: '100%' },
  gridDesktop: { flexDirection: 'row', gap: 24 },
  col: { width: '100%' },
  colDesktop: { flex: 1 },

  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, height: 46, gap: 9,
  },
  input: { flex: 1, fontSize: 13, backgroundColor: 'transparent', borderWidth: 0 },
  prefix: { fontSize: 12, fontWeight: '600' },
  divider: { width: 1, height: 18, marginHorizontal: 4 },
  errorText: { fontSize: 11, marginTop: 3 },

  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: {
    flex: 1, borderWidth: 1, borderRadius: 10,
    padding: 12, alignItems: 'center', minHeight: 82,
    backgroundColor: 'transparent',
  },

  submitBtn: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  switchText: { fontSize: 13, textAlign: 'center' },
  securityBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, maxHeight: '70%' },
  modalTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' },
  modalItem: { paddingVertical: 13, borderBottomWidth: 1 },
  modalClose: { marginTop: 10, padding: 13, borderRadius: 10 },
});
