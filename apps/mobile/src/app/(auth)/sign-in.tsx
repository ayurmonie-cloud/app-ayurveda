import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { AuthForm } from '@/features/auth/auth-form';
import { LanguagePicker } from '@/features/settings/language-picker';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  return (
    <Screen>
      <Text variant="title">{t('auth.signInTitle')}</Text>
      <Text color="textSecondary">{t('auth.signInSubtitle')}</Text>
      <AuthForm
        submitLabel={t('auth.signIn')}
        passwordAutoComplete="current-password"
        onSubmit={async (credentials) => {
          setError(null);
          // La redirection vers l'app se fait toute seule quand la session change.
          const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
          if (signInError) setError(signInError.message);
        }}
      />
      {error ? <Text color="danger">{error}</Text> : null}
      <Link href="/sign-up" replace>
        <Text color="primary">{t('auth.noAccount')}</Text>
      </Link>
      <LanguagePicker />
    </Screen>
  );
}
