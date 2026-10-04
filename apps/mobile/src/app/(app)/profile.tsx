import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { LanguagePicker } from '@/features/settings/language-picker';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();

  return (
    <Screen>
      <Text variant="title">{t('tabs.profile')}</Text>

      <Text variant="subtitle">{t('profile.language')}</Text>
      <LanguagePicker />

      <Text variant="subtitle">{t('profile.account')}</Text>
      {profile ? <Text color="textSecondary">{profile.email}</Text> : null}
      <Button
        title={t('auth.signOut')}
        variant="secondary"
        onPress={() => supabase.auth.signOut()}
      />

      <Text variant="caption" color="textSecondary">
        {t('profile.disclaimer')}
      </Text>
    </Screen>
  );
}
