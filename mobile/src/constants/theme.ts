import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Couleurs basées sur l'application web
export const colors = {
  primary: '#16a34a', // primary-600 (vert) pour les collectes
  secondary: '#3b82f6', // blue-500 pour les marchés
  background: '#f5f5f5',
  surface: '#ffffff',
  error: '#ef4444',
  text: '#333333',
  disabled: '#9e9e9e',
  placeholder: '#9e9e9e',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
  },
};
