// apps/navigation/RootNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Offer Lanka</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function RootNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#A85FFF',
        drawerInactiveTintColor: '#120024',
        drawerStyle: { backgroundColor: '#F6F2FF', width: 240 },
      }}
    >
      <Drawer.Screen name="HOME" component={HomeScreen} options={{ title: 'Home' }} />
      <Drawer.Screen name="REGISTER" component={RegisterScreen} options={{ title: 'Register' }} />
      <Drawer.Screen name="ADMIN" component={AdminPanelScreen} options={{ title: 'Admin Panel' }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    padding: 16,
    backgroundColor: '#A85FFF',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
});
