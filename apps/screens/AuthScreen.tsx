import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
  useWindowDimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Globe,
  Sun,
  Moon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Shield,
  User,
  Smartphone,
  Headphones,
  Store,
  ShoppingBag,
  Check,
  Zap,
  ChevronDown,
} from 'lucide-react-native';
import { useAppContext } from '../shared/AppContext';

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

export const AuthScreen: React.FC = () => {
  const { width: SCREEN_W } = useWindowDimensions();
  const IS_WEB_WIDE = Platform.OS === 'web' && SCREEN_W > 768;

  const { isDarkMode, toggleDarkMode, login, register, navigateTo, registerRole } = useAppContext();

  const colors = {
    bg: isDarkMode ? '#060112' : '#F6F2FF',
    cardBg: isDarkMode ? 'rgba(13, 6, 30, 0.82)' : 'rgba(255, 255, 255, 0.96)',
    cardBorder: isDarkMode ? 'rgba(108, 59, 255, 0.35)' : 'rgba(108, 59, 255, 0.2)',
    inputBg: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(108,59,255,0.03)',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(108, 59, 255, 0.25)',
    text: isDarkMode ? '#FFFFFF' : '#120024',
    subText: isDarkMode ? '#8E86A8' : '#6D5C80',
    accent: '#A85FFF',
    primary: '#7B2CBF',
    btnGradient: ['#7C4DFF', '#C77DFF'] as [string, string],
    pillBg: 'rgba(157, 78, 221, 0.15)',
    pillBorder: 'rgba(157, 78, 221, 0.3)',
    navPillBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(108, 59, 255, 0.06)',
    navPillBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(108, 59, 255, 0.18)',
    roleSelectedBg: 'rgba(124, 77, 255, 0.15)',
    roleSelectedBorder: '#7C4DFF',
    roleDefaultBg: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(108,59,255,0.04)',
    roleDefaultBorder: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(108,59,255,0.2)',
  };

  const [isRegister, setIsRegister] = useState(registerRole === 'MERCHANT');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);
  const [role, setRole] = useState<'NORMAL' | 'MERCHANT' | 'ADMIN'>(registerRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (registerRole === 'MERCHANT') {
      setIsRegister(true);
      setRole('MERCHANT');
    } else {
      setRole(registerRole);
    }
  }, [registerRole]);

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return;
    }
    setLoading(true);
    if (isRegister) {
      if (!name.trim()) { setErrorMsg('Full name is required.'); setLoading(false); return; }
      if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); setLoading(false); return; }
      if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); setLoading(false); return; }
      const digits = phone.replace(/[^0-9]/g, '');
      if (digits.length < 9) { setErrorMsg('Please enter a valid phone number.'); setLoading(false); return; }
      const res = await register(name.trim(), cleanEmail, role, password, district || 'Colombo', digits);
      if (res.success) {
        setSuccessMsg(res.message);
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await login(cleanEmail, password);
      if (!res.success) setErrorMsg(res.message);
    }
    setLoading(false);
  };

  // ---- REGISTER FORM (single centered card matching screenshot) ----
  const RegisterForm = () => (
    <View style={[styles.registerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      {/* Avatar Icon */}
      <View style={styles.avatarWrap}>
        <LinearGradient
          colors={colors.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarCircle}
        >
          <User size={28} color="#FFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      <Text style={[styles.regTitle, { color: colors.text }]}>
        Create <Text style={{ color: colors.accent }}>Account</Text>
      </Text>
      <Text style={[styles.regSubtitle, { color: colors.subText }]}>
        Join Offer Lanka and discover exclusive offers across Sri Lanka
      </Text>

      {errorMsg && (
        <View style={styles.alertError}>
          <Text style={styles.alertErrorText}>❌  {errorMsg}</Text>
        </View>
      )}
      {successMsg && (
        <View style={styles.alertSuccess}>
          <Text style={styles.alertSuccessText}>✅  {successMsg}</Text>
        </View>
      )}

      {/* Row 1: Full Name | Email */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <Text style={[styles.fieldLabel, { color: colors.subText }]}>FULL NAME</Text>
          <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
            <User size={16} color={colors.subText} />
            <TextInput
              style={[styles.inputText, { color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.subText}
              blurOnSubmit={false}
            />
          </View>
        </View>
        <View style={styles.gridCol}>
          <Text style={[styles.fieldLabel, { color: colors.subText }]}>EMAIL ADDRESS</Text>
          <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
            <Mail size={16} color={colors.subText} />
            <TextInput
              style={[styles.inputText, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor={colors.subText}
              keyboardType="email-address"
              autoCapitalize="none"
              blurOnSubmit={false}
            />
          </View>
        </View>
      </View>

      {/* Row 2: Phone (+94) | District */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <Text style={[styles.fieldLabel, { color: colors.subText }]}>PHONE NUMBER</Text>
          <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
            <Smartphone size={16} color={colors.subText} />
            <View style={[styles.phonePrefixBox, { borderColor: colors.inputBorder }]}>
              <Text style={{ color: colors.subText, fontSize: 13, fontWeight: '600' }}>+94</Text>
            </View>
            <TextInput
              style={[styles.inputText, { color: colors.text }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="/X XXX XXXX"
              placeholderTextColor={colors.subText}
              keyboardType="phone-pad"
              maxLength={9}
              blurOnSubmit={false}
            />
          </View>
        </View>
        <View style={styles.gridCol}>
          <Text style={[styles.fieldLabel, { color: colors.subText }]}>DISTRICT</Text>
          <TouchableOpacity
            style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
            onPress={() => setShowDistrictMenu(!showDistrictMenu)}
            activeOpacity={0.8}
          >
            <MapPin size={16} color={colors.subText} />
            <Text style={[styles.inputText, { color: district ? colors.text : colors.subText }]}>
              {district || 'Select your district'}
            </Text>
            <ChevronDown size={16} color={colors.subText} />
          </TouchableOpacity>
          {showDistrictMenu && (
            <View style={[styles.districtDropdown, { backgroundColor: isDarkMode ? '#1a0e3a' : '#fff', borderColor: colors.cardBorder }]}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.districtItem, { borderBottomColor: colors.inputBorder }]}
                    onPress={() => { setDistrict(d); setShowDistrictMenu(false); }}
                  >
                    <Text style={{ color: district === d ? colors.accent : colors.text, fontSize: 13 }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Row 3: Password | Confirm Password */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <Text style={[styles.fieldLabel, { color: colors.subText }]}>PASSWORD</Text>
          <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
            <Lock size={16} color={colors.subText} />
            <TextInput
              style={[styles.inputText, { color: colors.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              placeholderTextColor={colors.subText}
              secureTextEntry={!showPassword}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={16} color={colors.subText} /> : <EyeOff size={16} color={colors.subText} />}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.gridCol}>
          <Text style={[styles.fieldLabel, { color: colors.subText }]}>CONFIRM PASSWORD</Text>
          <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
            <Lock size={16} color={colors.subText} />
            <TextInput
              style={[styles.inputText, { color: colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••••••"
              placeholderTextColor={colors.subText}
              secureTextEntry={!showConfirm}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <Eye size={16} color={colors.subText} /> : <EyeOff size={16} color={colors.subText} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Account Type */}
      <View style={{ marginTop: 8, marginBottom: 24 }}>
        <Text style={[styles.fieldLabel, { color: colors.subText, marginBottom: 12 }]}>ACCOUNT TYPE</Text>
        <View style={styles.roleRow}>
          {([
            { key: 'NORMAL', label: 'Customer', desc: 'Explore & shop', Icon: User },
            { key: 'MERCHANT', label: 'Merchant', desc: 'Promote business', Icon: Store },
            { key: 'ADMIN', label: 'Admin', desc: 'Manage platform', Icon: Shield },
          ] as const).map(({ key, label, desc, Icon }) => {
            const sel = role === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: sel ? colors.roleSelectedBg : colors.roleDefaultBg,
                    borderColor: sel ? colors.roleSelectedBorder : colors.roleDefaultBorder,
                  },
                ]}
                onPress={() => setRole(key)}
                activeOpacity={0.8}
              >
                {sel && (
                  <View style={styles.roleCheck}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </View>
                )}
                <View style={[styles.roleIconWrap, { backgroundColor: sel ? 'rgba(124,77,255,0.2)' : 'rgba(255,255,255,0.06)' }]}>
                  <Icon size={20} color={sel ? colors.accent : colors.subText} />
                </View>
                <Text style={[styles.roleLabel, { color: sel ? colors.accent : colors.text }]}>{label}</Text>
                <Text style={[styles.roleDesc, { color: colors.subText }]}>{desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Create Account Button */}
      <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        <LinearGradient
          colors={colors.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitBtn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <User size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Create Account</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(false)} style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={[styles.switchText, { color: colors.subText }]}>
          Already have an account?{' '}
          <Text style={[styles.switchLink, { color: colors.accent }]}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ---- SIGN IN FORM ----
  const SignInForm = () => (
    <View style={[
      styles.formCard,
      IS_WEB_WIDE && styles.formCardWide,
      { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }
    ]}>
      {!IS_WEB_WIDE && (
        <View style={styles.mobileBrandingBlock}>
          <Image source={require('../assets/logo_full.png')} style={styles.brandingLogo} resizeMode="contain" />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.brandingTitle}>OFFER <Text style={{ color: colors.accent }}>LANKA</Text></Text>
            <Text style={[styles.brandingSub, { color: colors.subText }]}>Premium Live Offers Platform</Text>
          </View>
        </View>
      )}

      <Text style={[styles.formTitle, { color: colors.text }]}>
        Welcome <Text style={{ color: colors.accent }}>Back!</Text>
      </Text>
      <Text style={[styles.formSubtitle, { color: colors.subText }]}>
        Sign in to continue to your account
      </Text>

      {errorMsg && (
        <View style={styles.alertError}>
          <Text style={styles.alertErrorText}>❌  {errorMsg}</Text>
        </View>
      )}
      {successMsg && (
        <View style={styles.alertSuccess}>
          <Text style={styles.alertSuccessText}>✅  {successMsg}</Text>
        </View>
      )}

      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.subText }]}>EMAIL ADDRESS</Text>
        <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
          <Mail size={18} color={colors.subText} />
          <TextInput
            style={[styles.inputText, { color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@offerlanka.com"
            placeholderTextColor={colors.subText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.subText }]}>PASSWORD</Text>
        <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
          <Lock size={18} color={colors.subText} />
          <TextInput
            style={[styles.inputText, { color: colors.text }]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            placeholderTextColor={colors.subText}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <Eye size={18} color={colors.subText} /> : <EyeOff size={18} color={colors.subText} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' }}>
            <Check size={12} color="#fff" strokeWidth={3} />
          </View>
          <Text style={{ color: colors.text, fontSize: 12 }}>Remember me</Text>
        </View>
        <TouchableOpacity>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        <LinearGradient
          colors={colors.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitBtn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In →</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.orRow}>
        <View style={[styles.orLine, { backgroundColor: colors.cardBorder }]} />
        <Text style={[styles.orText, { color: colors.subText }]}>OR</Text>
        <View style={[styles.orLine, { backgroundColor: colors.cardBorder }]} />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <TouchableOpacity style={[styles.ssoBtn, { flex: 1, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={{ width: 18, height: 18 }} />
          <Text style={[styles.ssoBtnText, { color: colors.text }]}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ssoBtn, { flex: 1, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }} style={{ width: 18, height: 18 }} />
          <Text style={[styles.ssoBtnText, { color: colors.text }]}>Facebook</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setIsRegister(true)} style={{ marginTop: 4, alignItems: 'center' }}>
        <Text style={[styles.switchText, { color: colors.subText }]}>
          Don't have an account?{' '}
          <Text style={[styles.switchLink, { color: colors.accent }]}>Register</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigateTo('HOME')}
        style={{
          marginTop: 16,
          alignItems: 'center',
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          backgroundColor: 'rgba(124,77,255,0.06)',
        }}
      >
        <Text style={{ color: colors.subText, fontSize: 13, fontWeight: '600' }}>
          🏠 Back to Home  <Text style={{ color: colors.accent }}>(Continue as Guest)</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/city_skyline_bg.png')}
      style={styles.root}
      imageStyle={{ opacity: isDarkMode ? 0.8 : 0.2 }}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(8, 3, 20, 0.65)' : 'rgba(246, 242, 255, 0.85)' }]} />

      {/* ===== TOP NAVBAR ===== */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <Image source={require('../assets/logo_full.png')} style={styles.navLogoImg} resizeMode="contain" />
          <Text style={styles.navBrandText}>
            <Text style={{ color: colors.text }}>OFFER </Text>
            <Text style={{ color: colors.accent }}>LANKA</Text>
          </Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={[styles.navPill, { backgroundColor: colors.navPillBg, borderColor: colors.navPillBorder }]}>
            <Globe size={13} color={colors.text} style={{ marginRight: 4 }} />
            <Text style={[styles.navPillText, { color: colors.text }]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navIconBtn, { backgroundColor: colors.navPillBg, borderColor: colors.navPillBorder }]} onPress={toggleDarkMode}>
            {isDarkMode ? <Sun size={16} color={colors.accent} /> : <Moon size={16} color={colors.accent} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== MAIN CONTENT ===== */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">

          {isRegister ? (
            // Register: single centered wide card
            <View style={styles.registerWrapper}>
              {RegisterForm()}
            </View>
          ) : (
            // Sign In: split on desktop, single card on mobile
            <View style={[styles.mainLayout, IS_WEB_WIDE && styles.mainLayoutWide]}>
              {IS_WEB_WIDE && (
                <View style={styles.leftPanel}>
                  <Image source={require('../assets/logo_full.png')} style={styles.logoLarge} resizeMode="contain" />
                  <View style={[styles.premiumPill, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}>
                    <Text style={[styles.premiumPillText, { color: colors.accent }]}>🔥 Sri Lanka's Premium</Text>
                  </View>
                  <Text style={styles.heroTitle}>
                    <Text style={{ color: colors.text }}>Live Offers{'\n'}</Text>
                    <Text style={{ color: colors.accent }}>Platform</Text>
                  </Text>
                  <Text style={[styles.heroSubtitle, { color: colors.subText }]}>
                    Discover amazing offers, exclusive deals{'\n'}
                    and save more every day.
                  </Text>
                </View>
              )}
              {SignInForm()}
            </View>
          )}

          {/* Desktop footer row (sign in only) */}
          {IS_WEB_WIDE && !isRegister && (
            <View style={[styles.desktopFooter, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              {[
                { Icon: Lock, title: 'Secure & Safe', desc: 'Your data is protected\nwith top security' },
                { Icon: Headphones, title: '24/7 Support', desc: "We're here to help\nyou anytime" },
                { Icon: Shield, title: 'Verified Platform', desc: 'Trusted by thousands\nof users' },
                { Icon: Zap, title: 'Easy & Fast', desc: 'Simple and\nuser friendly' },
              ].map(({ Icon, title, desc }, i, arr) => (
                <React.Fragment key={title}>
                  <View style={styles.footerItem}>
                    <View style={styles.footerIconWrap}>
                      <Icon size={20} color={colors.text} />
                    </View>
                    <View>
                      <Text style={[styles.footerTitle, { color: colors.text }]}>{title}</Text>
                      <Text style={[styles.footerDesc, { color: colors.subText }]}>{desc}</Text>
                    </View>
                  </View>
                  {i < arr.length - 1 && <View style={styles.footerDivider} />}
                </React.Fragment>
              ))}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

// ============ Styles ============
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBrandText: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navPill: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  navPillText: { fontSize: 12, fontWeight: '700' },
  navIconBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  navLogoImg: { width: 44, height: 44, borderRadius: 10 },

  // Scroll
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Register wrapper (centered)
  registerWrapper: {
    width: '100%',
    maxWidth: 720,
    paddingTop: 10,
    paddingBottom: 20,
  },

  // Register card
  registerCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 36,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },

  // Avatar
  avatarWrap: { alignItems: 'center', marginBottom: 16 },
  avatarCircle: {
    width: 68, height: 68, borderRadius: 34,
    justifyContent: 'center', alignItems: 'center',
  },

  // Register titles
  regTitle: {
    fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 6,
  },
  regSubtitle: {
    fontSize: 13, textAlign: 'center', marginBottom: 28, lineHeight: 20,
  },

  // 2-column grid
  gridRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
    position: 'relative',
  },

  // Role cards
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'relative',
  },
  roleCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  roleLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  roleDesc: { fontSize: 11, textAlign: 'center' },

  // Phone prefix
  phonePrefixBox: {
    borderRightWidth: 1,
    paddingRight: 8,
    marginRight: 4,
  },

  // District dropdown
  districtDropdown: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  districtItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  // Sign In layout
  mainLayout: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLayoutWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 60,
    marginBottom: 40,
    maxWidth: 1000,
    paddingHorizontal: 20,
  },

  // Mobile branding
  mobileBrandingBlock: {
    flexDirection: 'column', alignItems: 'center',
    gap: 12, marginBottom: 30, marginTop: -10,
  },
  brandingLogo: { width: 70, height: 70 },
  brandingTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  brandingSub: { fontSize: 11, marginTop: 2 },

  // Left Panel
  leftPanel: { flex: 1, maxWidth: 420, alignItems: 'flex-start' },
  logoLarge: { width: 200, height: 200, marginBottom: 20 },
  premiumPill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginBottom: 20, borderWidth: 1,
  },
  premiumPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  heroTitle: { fontSize: 48, fontWeight: '900', lineHeight: 52, marginBottom: 16 },
  heroSubtitle: { fontSize: 14, lineHeight: 24, marginBottom: 40 },

  // Sign In form card
  formCard: {
    width: '100%', maxWidth: 400,
    borderWidth: 1, borderRadius: 16,
    padding: 32,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 30, elevation: 10,
  },
  formCardWide: { maxWidth: 440 },
  formTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  formSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 28 },

  // Form fields
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 10, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, height: 48, gap: 10,
  },
  inputText: { flex: 1, fontSize: 14, backgroundColor: 'transparent', borderWidth: 0 },

  // SSO
  ssoBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', height: 48,
    borderRadius: 10, borderWidth: 1, gap: 10,
  },
  ssoBtnText: { fontSize: 13, fontWeight: '600' },

  // Submit
  submitBtn: {
    height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Alerts
  alertError: {
    backgroundColor: 'rgba(213,0,0,0.12)', borderWidth: 1,
    borderColor: '#D50000', borderRadius: 8, padding: 10, marginBottom: 16,
  },
  alertErrorText: { color: '#FF5252', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  alertSuccess: {
    backgroundColor: 'rgba(0,200,83,0.1)', borderWidth: 1,
    borderColor: '#00C853', borderRadius: 8, padding: 10, marginBottom: 16,
  },
  alertSuccessText: { color: '#00E676', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // OR Row
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 11, fontWeight: '600' },
  switchText: { fontSize: 13, textAlign: 'center' },
  switchLink: { fontWeight: '700' },

  // Desktop Footer
  desktopFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    maxWidth: 1000, width: '100%',
    borderWidth: 1, borderRadius: 16,
    padding: 24,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  footerIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(124,77,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  footerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  footerDesc: { fontSize: 11, lineHeight: 16 },
  footerDivider: { width: 1, height: 40, backgroundColor: 'rgba(108,59,255,0.2)', marginHorizontal: 8 },
});
