import { Platform } from 'react-native';

/** Palette chaude inspirée des épices et de la terre ; à ajuster avec l'identité d'Ayurmonie. */
export const Colors = {
  light: {
    text: '#2B2620',
    textSecondary: '#6B6259',
    background: '#FBF7F2',
    backgroundElement: '#F1E8DD',
    border: '#E2D6C8',
    primary: '#A4552A',
    primaryText: '#FFFFFF',
    accent: '#6F8361',
    danger: '#B3261E',
  },
  dark: {
    text: '#F3ECE4',
    textSecondary: '#B7ADA2',
    background: '#1B1815',
    backgroundElement: '#2A2520',
    border: '#3B342D',
    primary: '#D88A5B',
    primaryText: '#1B1815',
    accent: '#9DB08D',
    danger: '#F2B8B5',
  },
} as const;

export type ThemeColors = (typeof Colors)['light'] | (typeof Colors)['dark'];
export type ThemeColor = keyof typeof Colors.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif' },
  default: { sans: 'normal', serif: 'serif' },
});

export const MaxContentWidth = 640;
