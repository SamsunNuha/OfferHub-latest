export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  border: string;
  primary: string;
  secondary: string;
  text: string;
  subText: string;
  
  // Functional Colors
  amber: string;
  success: string;
  warning: string;
  error: string;
}

export const CosmicDarkTheme: ThemeColors = {
  background: '#0C0717',
  surface: '#160F2B',
  surfaceVariant: '#22183D',
  border: '#3F2D6B',
  primary: '#C78DFF', // Neon Lavender
  secondary: '#8E24AA', // Brand Purple
  text: '#FFFFFF',
  subText: '#B0A2C9',
  
  amber: '#FFC107',
  success: '#00C853',
  warning: '#FFA000',
  error: '#D50000',
};

export const PastelLightTheme: ThemeColors = {
  background: '#F6F2FF',
  surface: '#FFFFFF',
  surfaceVariant: '#EDE5FC',
  border: '#D1C4E9',
  primary: '#7C4DFF',
  secondary: '#6200EA',
  text: '#120024',
  subText: '#6D5C80',
  
  amber: '#FFC107',
  success: '#00C853',
  warning: '#FFA000',
  error: '#D50000',
};

export const Typography = {
  fontFamily: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    title: 28,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
    black: '900' as const,
  }
};
