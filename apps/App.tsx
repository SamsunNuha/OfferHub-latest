import { useContext } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { AppContext } from './shared/AppContext';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from '../shared/AppContext';
import RootNavigator from './navigation/RootNavigator';

function NotificationBanner() {
  const { bannerNotification } = useContext(AppContext);
  if (!bannerNotification) return null;
  return (
    <View style={styles.bannerContainer}>
      <Text style={styles.bannerText}>{bannerNotification}</Text>
    </View>
  );
}

function AppContent() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
        <NotificationBanner />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 0 : 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 8,
    zIndex: 1000,
  },
  bannerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
}
