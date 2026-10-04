import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import type { ThemeColor } from '@/constants/theme';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextProps = RNTextProps & {
  variant?: 'body' | 'title' | 'subtitle' | 'caption' | 'label';
  color?: ThemeColor;
};

export function Text({ variant = 'body', color = 'text', style, ...rest }: TextProps) {
  const theme = useTheme();
  return <RNText style={[{ color: theme[color] }, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  body: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 32, lineHeight: 40, fontWeight: '600', fontFamily: Fonts?.serif },
  subtitle: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
