// apps/screens/MainApp.tsx
// Global Shell and Responsive Router based on AppContext's currentScreen state
import React from 'react';
import { 
  View, TouchableOpacity, Text, StyleSheet, Platform, 
  ScrollView, useWindowDimensions, Modal 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, Home, Tag, Zap, Star, User, Package, Heart, 
  MapPin, ShoppingCart, Award, Truck, MessageSquare, HelpCircle, 
  Store, Sun, Moon, Camera, X, TrendingUp
} from 'lucide-react-native';

import { HomeScreen } from './HomeScreen';
import { AuthScreen } from './AuthScreen';
import { MarketplaceScreen } from './MarketplaceScreen';
import { SearchScreen } from './SearchScreen';
import { DetailScreen } from './DetailScreen';
import { CartScreen } from './CartScreen';
import { CheckoutScreen } from './CheckoutScreen';
import { ProfileScreen } from './ProfileScreen';
import { LoyaltyScreen } from './LoyaltyScreen';
import { MapScreen } from './MapScreen';
import { AdminPanelScreen } from './AdminPanelScreen';
import { BusinessDashboardScreen } from './BusinessDashboardScreen';
import { AiChatbotScreen } from './AiChatbotScreen';
import { NativeLabsScreen } from './NativeLabsScreen';
import { VisaPaymentScreen } from './VisaPaymentScreen';
import { OffersScreen } from './OffersScreen';
import RegisterScreen from './RegisterScreen';
import { AIScannerScreen } from './AIScannerScreen';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { id: 'HOME',          label: 'Home',           Icon: Home    },
      { id: 'VISUAL_SEARCH', label: 'AI Lens Scanner',Icon: Camera,  badge: 'NEW' },
      { id: 'CATEGORIES',    label: 'Categories',     Icon: Tag     },
      { id: 'BRANDS',        label: 'Sri Lankan Brands',Icon: Award },
      { id: 'OFFERS',        label: 'All Offers',     Icon: Award   },
      { id: 'FLASH',         label: 'Flash Deals',    Icon: Zap,    badge: 'LIVE' },
      { id: 'NEW',           label: 'New Arrivals',   Icon: TrendingUp },
      { id: 'TOPRATED',      label: 'Top Rated',      Icon: Star    },
    ],
  },
  {
    label: 'MY ACCOUNT',
    items: [
      { id: 'PROFILE',    label: 'Profile',     Icon: User    },
      { id: 'ORDERS',     label: 'My Orders',   Icon: Package },
      { id: 'WISHLIST',   label: 'Wishlist',    Icon: Heart   },
      { id: 'REVIEWS',    label: 'My Reviews',  Icon: MessageSquare },
      { id: 'ADDRESSES',  label: 'Addresses',   Icon: MapPin  },
    ],
  },
  {
    label: 'SHOPPING',
    items: [
      { id: 'CART',       label: 'Cart',        Icon: ShoppingCart },
      { id: 'MAP',        label: 'Track Order', Icon: Truck   },
      { id: 'COUPONS',    label: 'Coupons',     Icon: Tag     },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { id: 'HELP',       label: 'Help Center', Icon: HelpCircle   },
      { id: 'CONTACT',    label: 'Contact Us',  Icon: MessageSquare},
      { id: 'FAQ',        label: 'FAQ',         Icon: HelpCircle   },
    ],
  },
];

export const MainApp: React.FC = () => {
  const { 
    currentScreen, goBack, canGoBack, isDarkMode, toggleDarkMode, 
    cart, isDrawerOpen, setIsDrawerOpen, navigateTo 
  } = useAppContext();

  const { width: WIN_W } = useWindowDimensions();
  const IS_DESKTOP = Platform.OS === 'web' && WIN_W > 900;

  const showBackBtn = canGoBack && currentScreen !== 'HOME';
  const showSidebar = currentScreen !== 'AUTH' && currentScreen !== 'REGISTER';

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const colors = {
    bg: isDarkMode ? '#0C0717' : '#FFFFFF',
    sidebar: isDarkMode ? '#160F2B' : '#F6F2FF',
    border: isDarkMode ? '#3F2D6B' : '#E0D7FF',
    accent: '#A865C9',
    accentSoft: 'rgba(168,95,255,0.15)',
    sub: isDarkMode ? '#B0A2C9' : '#5A4A7A',
    text: isDarkMode ? '#FFFFFF' : '#120024',
    gradient: ['#A865C9', '#BF77F6'] as [string, string],
    backBg: isDarkMode ? 'rgba(22,15,43,0.92)' : 'rgba(255,255,255,0.92)',
    backBorder: isDarkMode ? 'rgba(124,77,255,0.35)' : 'rgba(124,77,255,0.25)',
    icon: '#C78DFF',
    live: '#FF3D57',
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen />;
      case 'AUTH':
        return <AuthScreen />;
      case 'REGISTER':
        return <RegisterScreen navigation={{ navigate: () => {} }} />;
      case 'MARKETPLACE':
      case 'CATEGORIES':
      case 'NEW':
      case 'TOPRATED':
      case 'PRODUCTS':
      case 'BRANDS':
        return <MarketplaceScreen />;
      case 'OFFERS':
      case 'FLASH':
      case 'COUPONS':
      case 'AUCTIONS':
        return <OffersScreen />;
      case 'SEARCH':
        return <SearchScreen />;
      case 'DETAIL':
      case 'OFFER_DETAIL':
      case 'PRODUCT_DETAIL':
        return <DetailScreen />;
      case 'CART':
        return <CartScreen />;
      case 'CHECKOUT':
        return <CheckoutScreen />;
      case 'PROFILE':
      case 'ORDERS':
      case 'WISHLIST':
      case 'REVIEWS':
      case 'ADDRESSES':
        return <ProfileScreen />;
      case 'LOYALTY':
        return <LoyaltyScreen />;
      case 'MAP':
        return <MapScreen />;
      case 'ADMIN_PANEL':
        return <AdminPanelScreen />;
      case 'BUSINESS_DASHBOARD':
      case 'MERCHANT':
        return <BusinessDashboardScreen />;
      case 'AI_CHATBOT':
      case 'HELP':
      case 'CONTACT':
      case 'FAQ':
        return <AiChatbotScreen />;
      case 'NATIVE_LABS':
        return <NativeLabsScreen />;
      case 'VISA_PAYMENT':
        return <VisaPaymentScreen />;
      case 'VISUAL_SEARCH':
        return <AIScannerScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const Sidebar = () => (
    <View style={[styles.sidebar, { backgroundColor: colors.sidebar, borderRightColor: colors.border }]}>
      {/* Logo */}
      <TouchableOpacity style={styles.sidebarLogo} onPress={() => { navigateTo('HOME'); setIsDrawerOpen(false); }}>
        <LinearGradient colors={colors.gradient} style={styles.logoIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <ShoppingCart size={16} color="#fff" />
        </LinearGradient>
        <View>
          <Text style={[styles.logoTitle, { color: colors.text }]}>OfferHub</Text>
          <Text style={[styles.logoSub, { color: colors.accent }]}>Sri Lanka</Text>
        </View>
      </TouchableOpacity>

      {/* Nav */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {NAV_SECTIONS.map((sec, si) => (
          <View key={si} style={{ marginBottom: 8 }}>
            {sec.label && <Text style={[styles.navSectionLabel, { color: colors.sub }]}>{sec.label}</Text>}
            {sec.items.map(item => {
              const active = currentScreen === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.navItem, active && [styles.navItemActive, { backgroundColor: colors.accentSoft }]]}
                  onPress={() => { navigateTo(item.id); setIsDrawerOpen(false); }}
                >
                  <item.Icon size={16} color={active ? colors.accent : colors.sub} />
                  <Text style={[styles.navItemText, { color: active ? colors.accent : colors.sub }]}>{item.label}</Text>
                  {(item as any).badge && (
                    <View style={[styles.liveBadge, { backgroundColor: colors.live }]}>
                      <Text style={styles.liveBadgeText}>{(item as any).badge}</Text>
                    </View>
                  )}
                  {item.id === 'WISHLIST' && (
                    <View style={[styles.countBadge, { backgroundColor: colors.accent }]}><Text style={styles.countBadgeText}>12</Text></View>
                  )}
                  {item.id === 'CART' && cartCount > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: colors.accent }]}><Text style={styles.countBadgeText}>{cartCount}</Text></View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Become Seller CTA */}
        <LinearGradient colors={['#3E1D7A', '#6C3DBE']} style={styles.sellerCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Store size={18} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={styles.sellerCtaTitle}>Become a Seller</Text>
          <Text style={styles.sellerCtaSub}>Grow your business with OfferHub</Text>
          <TouchableOpacity style={styles.sellerCtaBtn} onPress={() => { navigateTo('MERCHANT'); setIsDrawerOpen(false); }}>
            <Text style={styles.sellerCtaBtnText}>Join Now</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Dark mode toggle */}
        <TouchableOpacity style={styles.darkToggle} onPress={toggleDarkMode}>
          {isDarkMode
            ? <Sun size={15} color={colors.accent} />
            : <Moon size={15} color={colors.accent} />}
          <Text style={[styles.darkToggleText, { color: colors.sub }]}>Dark Mode</Text>
          <View style={[styles.toggleTrack, { backgroundColor: colors.bg }, isDarkMode && { backgroundColor: colors.accent }]}>
            <View style={[styles.toggleThumb, isDarkMode && { alignSelf: 'flex-end' }]} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, flexDirection: 'row' }}>
      {/* Desktop sidebar */}
      {IS_DESKTOP && showSidebar && <Sidebar />}

      {/* Main page content area */}
      <View style={{ flex: 1, position: 'relative' }}>
        {renderScreen()}

        {/* Floating Back Button — visible on all inner screens */}
        {showBackBtn && (
          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.backBg,
                borderColor: colors.backBorder,
              }
            ]}
            onPress={goBack}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} color={colors.icon} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile sidebar drawer overlay */}
      {!IS_DESKTOP && showSidebar && (
        <Modal
          visible={isDrawerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsDrawerOpen(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setIsDrawerOpen(false)}
          >
            <View style={styles.drawerContainer} onStartShouldSetResponder={() => true}>
              <View style={styles.drawerHeader}>
                <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <Sidebar />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 210,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 10,
  },
  sidebarLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontWeight: '900',
    fontSize: 15,
  },
  logoSub: {
    fontSize: 10,
    fontWeight: '700',
  },
  navSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 14,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  navItemActive: {
    borderRightWidth: 2,
    borderRightColor: '#A865C9',
  },
  navItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  liveBadge: {
    marginLeft: 'auto',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  countBadge: {
    marginLeft: 'auto',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  sellerCta: {
    margin: 10,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  sellerCtaTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  sellerCtaSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 10,
  },
  sellerCtaBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  sellerCtaBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  darkToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
    marginTop: 8,
  },
  darkToggleText: {
    fontSize: 12,
    flex: 1,
  },
  toggleTrack: {
    width: 32,
    height: 18,
    borderRadius: 9,
    padding: 2,
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 10 : 40,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#7C4DFF',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: 220,
    height: '100%',
    backgroundColor: '#160F2B',
  },
  drawerHeader: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
});

export default MainApp;
