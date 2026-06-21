// apps/context/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

// Premium purple dark theme tokens
const darkColors = {
  primary: '#6C3BFF',
  secondary: '#8B5CF6',
  background: '#080014',
  surface: '#140726',
  error: '#FF1744',
  text: '#FFFFFF',
  onSurface: '#FFFFFF',
  disabled: '#555555',
  placeholder: '#B0A2C9',
  backdrop: 'rgba(0,0,0,0.5)',
};

const lightColors = {
  primary: '#6C3BFF',
  secondary: '#8B5CF6',
  background: '#F6F2FF',
  surface: '#FFFFFF',
  error: '#B00020',
  text: '#120024',
  onSurface: '#120024',
  disabled: '#AAAAAA',
  placeholder: '#6D5C80',
  backdrop: 'rgba(0,0,0,0.5)',
};

export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    ...DefaultTheme,
    dark: isDark,
    colors: isDark ? darkColors : lightColors,
    roundness: 8,
    fonts: {
      regular: { fontFamily: 'Inter', fontWeight: '400' },
      medium: { fontFamily: 'Inter', fontWeight: '500' },
      light: { fontFamily: 'Inter', fontWeight: '300' },
      thin: { fontFamily: 'Inter', fontWeight: '200' },
    },
  } as const;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
