// Root App.tsx - Entry point for Expo
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './apps/shared/AppContext';
import { ThemeProvider } from './apps/context/ThemeContext';
import { MainApp } from './apps/screens/MainApp';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainApp />
        <StatusBar style="auto" />
      </AppProvider>
    </ThemeProvider>
  );
}
