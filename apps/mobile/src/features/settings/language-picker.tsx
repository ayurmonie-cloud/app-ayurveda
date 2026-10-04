import { resolveLocale, SUPPORTED_LOCALES } from '@ayurmonie/core';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useUpdateLocale } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';

/** Choix de la langue, disponible avant la connexion et dans le profil. */
export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const updateLocale = useUpdateLocale();
  const selected = resolveLocale([i18n.language]);

  return (
    <View
      style={styles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('profile.language')}
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const isSelected = locale === selected;
        return (
          <Pressable
            key={locale}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            onPress={() => updateLocale.mutate(locale)}
            style={[
              styles.option,
              {
                borderColor: isSelected ? theme.primary : theme.border,
                backgroundColor: isSelected ? theme.backgroundElement : 'transparent',
              },
            ]}
          >
            <Text variant="label" color={isSelected ? 'primary' : 'text'}>
              {t(`languages.${locale}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  option: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
