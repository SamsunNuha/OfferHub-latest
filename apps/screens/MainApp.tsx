// apps/screens/MainApp.tsx
// Simple screen router based on AppContext's currentScreen state
import React from 'react';
import { View } from 'react-native';
import { useAppContext } from '../shared/AppContext';

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

export const MainApp: React.FC = () => {
  const { currentScreen } = useAppContext();

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
        return <AuthScreen />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
    </View>
  );
};

export default MainApp;
