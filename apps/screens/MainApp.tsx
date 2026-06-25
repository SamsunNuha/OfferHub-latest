// apps/screens/MainApp.tsx
// Simple screen router based on AppContext's currentScreen state
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { ChevronLeft } from 'lucide-react-native';

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
import RegisterScreen from './RegisterScreen';

// Screens that have their own full-screen header — back button is shown at top
const SCREENS_WITH_HEADER = ['HOME'];

export const MainApp: React.FC = () => {
  const { currentScreen, goBack, canGoBack, isDarkMode } = useAppContext();

  const showBackBtn = canGoBack && !SCREENS_WITH_HEADER.includes(currentScreen);

  const colors = {
    bg: isDarkMode ? 'rgba(22,15,43,0.92)' : 'rgba(255,255,255,0.92)',
    text: isDarkMode ? '#FFFFFF' : '#120024',
    border: isDarkMode ? 'rgba(124,77,255,0.35)' : 'rgba(124,77,255,0.25)',
    icon: '#C78DFF',
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
        return <MarketplaceScreen />;
      case 'SEARCH':
        return <SearchScreen />;
      case 'DETAIL':
        return <DetailScreen />;
      case 'CART':
        return <CartScreen />;
      case 'CHECKOUT':
        return <CheckoutScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      case 'LOYALTY':
        return <LoyaltyScreen />;
      case 'MAP':
        return <MapScreen />;
      case 'ADMIN_PANEL':
        return <AdminPanelScreen />;
      case 'BUSINESS_DASHBOARD':
        return <BusinessDashboardScreen />;
      case 'AI_CHATBOT':
        return <AiChatbotScreen />;
      case 'NATIVE_LABS':
        return <NativeLabsScreen />;
      case 'VISA_PAYMENT':
        return <VisaPaymentScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}

      {/* Floating Back Button — visible on all inner screens */}
      {showBackBtn && (
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
            }
          ]}
          onPress={goBack}
          activeOpacity={0.8}
        >
          <ChevronLeft size={18} color={colors.icon} strokeWidth={2.5} />
          <Text style={[styles.backBtnText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 14 : 44,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#7C4DFF',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default MainApp;
