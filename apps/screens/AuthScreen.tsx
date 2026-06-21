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
  Dimensions,
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
  QrCode,
  Shield,
  User,
  Smartphone,
  Percent,
  Headphones,
  Store,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  Zap
} from 'lucide-react-native';
import { useAppContext } from '../shared/AppContext';

export const AuthScreen: React.FC = () => {
  const { width: SCREEN_W } = useWindowDimensions();
  const IS_WEB_WIDE = Platform.OS === 'web' && SCREEN_W > 768;

  const { isDarkMode, toggleDarkMode, login, register } = useAppContext();

  const colors = {
    bg: isDarkMode ? '#060112' : '#F6F2FF',
    cardBg: isDarkMode ? 'rgba(13, 6, 30, 0.75)' : 'rgba(255, 255, 255, 0.95)',
    cardBorder: isDarkMode ? 'rgba(108, 59, 255, 0.3)' : 'rgba(108, 59, 255, 0.2)',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(108, 59, 255, 0.3)',
    text: isDarkMode ? '#FFFFFF' : '#120024',
    subText: isDarkMode ? '#8E86A8' : '#6D5C80',
    accent: '#A85FFF', 
    primary: '#7B2CBF',
    btnGradient: ['#7C4DFF', '#C77DFF'] as [string, string],
    pillBg: 'rgba(157, 78, 221, 0.15)',
    pillBorder: 'rgba(157, 78, 221, 0.3)',
    navPillBg: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(108, 59, 255, 0.05)',
    navPillBorder: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(108, 59, 255, 0.15)',
  };

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'NORMAL' | 'MERCHANT' | 'ADMIN'>('NORMAL');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      if (digits.length !== 10) { setErrorMsg('Phone must be exactly 10 digits.'); setLoading(false); return; }
      const res = await register(name.trim(), cleanEmail, role, password, 'Colombo', digits);
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

  const PremiumPill = () => (
    <View style={[styles.premiumPill, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}>
      <Text style={[styles.premiumPillText, { color: colors.accent }]}>🔥 Sri Lanka's Premium</Text>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../assets/city_skyline_bg.png')} 
      style={styles.root}
      imageStyle={{ opacity: isDarkMode ? 0.8 : 0.2 }}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(8, 3, 20, 0.65)' : 'rgba(246, 242, 255, 0.85)' }]} />
      
      {/* ============ TOP NAVBAR ============ */}
      <View style={[styles.navbar]}>
        <View style={styles.navBrand}>
          {!isRegister ? (
            <Image source={require('../assets/logo.png')} style={styles.navLogoImg} resizeMode="contain" />
          ) : (
            <LinearGradient
              colors={colors.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.navLogoCircle}
            >
              <ShoppingBag size={18} color="#FFF" />
            </LinearGradient>
          )}
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

      {/* ============ MAIN CONTENT ============ */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainLayout, IS_WEB_WIDE && styles.mainLayoutWide]}>
            
            {/* ---- LEFT BRANDING PANEL (DESKTOP ONLY) ---- */}
            {IS_WEB_WIDE && (
              <View style={styles.leftPanel}>
                <Image source={require('../assets/logo.png')} style={styles.logoLarge} resizeMode="contain" />
                <PremiumPill />
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

            {/* ---- RIGHT FORM CARD ---- */}
            <View style={[
              styles.formCard, 
              IS_WEB_WIDE && styles.formCardWide,
              { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }
            ]}>
              {!IS_WEB_WIDE && (
                <View style={styles.mobileBrandingBlock}>
                  <Image source={require('../assets/logo.png')} style={styles.brandingLogo} resizeMode="contain" />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.brandingTitle}>OFFER <Text style={{ color: colors.accent }}>LANKA</Text></Text>
                    <Text style={[styles.brandingSub, { color: colors.subText }]}>Premium Live Offers Platform</Text>
                  </View>
                </View>
              )}
              
              {!IS_WEB_WIDE && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <PremiumPill />
                </View>
              )}
              
              <Text style={[styles.formTitle, { color: colors.text }]}>
                Welcome <Text style={{ color: colors.accent }}>Back!</Text>
              </Text>
              <Text style={[styles.formSubtitle, { color: colors.subText }]}>
                {isRegister
                  ? 'Create your Offer Lanka account'
                  : 'Sign in to continue to your account'}
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

              {isRegister && (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Full Name</Text>
                    <View style={[styles.inputRow, { borderColor: colors.inputBorder }]}>
                      <User size={18} color={colors.subText} />
                      <TextInput
                        style={[styles.inputText, { color: colors.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        placeholderTextColor={colors.subText}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Phone Number</Text>
                    <View style={[styles.inputRow, { borderColor: colors.inputBorder }]}>
                      <Smartphone size={18} color={colors.subText} />
                      <TextInput
                        style={[styles.inputText, { color: colors.text }]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="077 123 4567"
                        placeholderTextColor={colors.subText}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                </>
              )}

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Email Address</Text>
                <View style={[styles.inputRow, { borderColor: colors.inputBorder }]}>
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
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Password</Text>
                <View style={[styles.inputRow, { borderColor: colors.inputBorder }]}>
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

              {isRegister && (
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Confirm Password</Text>
                  <View style={[styles.inputRow, { borderColor: colors.inputBorder }]}>
                    <Lock size={18} color={colors.subText} />
                    <TextInput
                      style={[styles.inputText, { color: colors.text }]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••••••"
                      placeholderTextColor={colors.subText}
                      secureTextEntry={!showConfirm}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <Eye size={18} color={colors.subText} /> : <EyeOff size={18} color={colors.subText} />}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {isRegister && (
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Account Type</Text>
                  <View style={styles.roleRow}>
                    {(['NORMAL', 'MERCHANT', 'ADMIN'] as const).map((r) => {
                      const isSelected = role === r;
                      const IconComponent = r === 'NORMAL' ? User : r === 'MERCHANT' ? Store : Shield;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.roleBtn,
                            { borderColor: colors.inputBorder },
                            isSelected && { backgroundColor: colors.accent, borderColor: colors.accent },
                          ]}
                          onPress={() => setRole(r)}
                        >
                          <IconComponent size={14} color={isSelected ? '#fff' : colors.subText} style={{ marginRight: 6 }} />
                          <Text style={[
                            styles.roleBtnText,
                            { color: isSelected ? '#fff' : colors.subText }
                          ]}>
                            {r === 'NORMAL' ? 'Customer' : r === 'MERCHANT' ? 'Merchant' : 'Admin'}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>
              )}

              {/* Remember me & Forgot password for Sign In */}
              {!isRegister && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
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
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={colors.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.submitBtnText}>
                        {isRegister ? 'Create Account' : 'Sign In \u2192'}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.orRow}>
                <View style={[styles.orLine, { backgroundColor: colors.cardBorder }]} />
                <Text style={[styles.orText, { color: colors.subText }]}>OR</Text>
                <View style={[styles.orLine, { backgroundColor: colors.cardBorder }]} />
              </View>

              {/* SSO Buttons for Sign In */}
              {!isRegister && (
                <View style={{ gap: 12, marginBottom: 24 }}>
                  <TouchableOpacity style={[styles.ssoBtn, { borderColor: colors.inputBorder }]} onPress={() => {/* TODO: Google sign‑in */}}>
                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={{ width: 18, height: 18 }} />
                    <Text style={[styles.ssoBtnText, { color: colors.text }]}>Continue with Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.ssoBtn, { borderColor: colors.inputBorder }]} onPress={() => {/* TODO: Facebook sign‑in */}}>
                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }} style={{ width: 18, height: 18 }} />
                    <Text style={[styles.ssoBtnText, { color: colors.text }]}>Continue with Facebook</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* ---- DESKTOP FOOTER ROW ---- */}
          {IS_WEB_WIDE && (
            <View style={[styles.desktopFooter, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.footerItem}>
                <View style={styles.footerIconWrap}>
                  <Lock size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={[styles.footerTitle, { color: colors.text }]}>Secure & Safe</Text>
                  <Text style={[styles.footerDesc, { color: colors.subText }]}>Your data is protected{'\n'}with top security</Text>
                </View>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <View style={styles.footerIconWrap}>
                  <Headphones size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={[styles.footerTitle, { color: colors.text }]}>24/7 Support</Text>
                  <Text style={[styles.footerDesc, { color: colors.subText }]}>We're here to help{'\n'}you anytime</Text>
                </View>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <View style={styles.footerIconWrap}>
                  <Shield size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={[styles.footerTitle, { color: colors.text }]}>Verified Platform</Text>
                  <Text style={[styles.footerDesc, { color: colors.subText }]}>Trusted by thousands{'\n'}of users</Text>
                </View>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <View style={styles.footerIconWrap}>
                  <Zap size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={[styles.footerTitle, { color: colors.text }]}>Easy & Fast</Text>
                  <Text style={[styles.footerDesc, { color: colors.subText }]}>Simple and{'\n'}user friendly</Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

// ============ Styles ============
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBrandText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLogoImg: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },

  // Scroll Content
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
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

  // Branding Block
  brandingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  mobileBrandingBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
    marginTop: -10,
  },
  brandingLogo: {
    width: 50,
    height: 50,
  },
  brandingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  brandingSub: {
    fontSize: 11,
    marginTop: 2,
  },

  // Left Panel (Desktop)
  leftPanel: {
    flex: 1,
    maxWidth: 420,
    alignItems: 'flex-start',
  },
  logoLarge: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  premiumPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  premiumPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresList: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
  },

  // Form Card
  formCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 16,
    padding: 32,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10,
  },
  formCardWide: {
    maxWidth: 440,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 32,
  },

  // Form Fields
  fieldGroup: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    gap: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  
  // Role Buttons
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // SSO Buttons
  ssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'transparent',
    gap: 10,
  },
  ssoBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Submit Btn
  submitBtn: {
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Alerts
  alertError: {
    backgroundColor: 'rgba(213,0,0,0.12)',
    borderWidth: 1,
    borderColor: '#D50000',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  alertErrorText: { color: '#FF5252', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  alertSuccess: {
    backgroundColor: 'rgba(0,200,83,0.1)',
    borderWidth: 1,
    borderColor: '#00C853',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  alertSuccessText: { color: '#00E676', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // OR Row
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 11,
    fontWeight: '600',
  },
  switchText: {
    fontSize: 13,
    textAlign: 'center',
  },
  switchLink: {
    fontWeight: '700',
  },

  // Desktop Footer
  desktopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1000,
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 16,
    borderWidth: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  footerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  footerDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  footerDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    marginHorizontal: 16,
  },
});

export default AuthScreen;
