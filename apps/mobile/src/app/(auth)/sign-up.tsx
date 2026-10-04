import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { AuthForm } from '@/features/auth/auth-form';
import { currentLocale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  return (
    <Screen>
      <Text variant="title">{t('auth.signUpTitle')}</Text>
      <Text color="textSecondary">{t('auth.signUpSubtitle')}</Text>
      <AuthForm
        submitLabel={t('auth.signUp')}
        passwordAutoComplete="new-password"
        onSubmit={async ({ email, password }) => {
          setMessage(null);
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            // Lu par le déclencheur `handle_new_user` pour créer le profil dans la bonne langue.
            options: { data: { locale: currentLocale() } },
          });
          if (error) setMessage({ kind: 'error', text: error.message });
          else if (!data.session) setMessage({ kind: 'info', text: t('auth.checkEmail') });
        }}
      />
      {message ? (
        <Text color={message.kind === 'error' ? 'danger' : 'textSecondary'}>{message.text}</Text>
      ) : null}
      <Link href="/sign-in" replace>
        <Text color="primary">{t('auth.hasAccount')}</Text>
      </Link>
    </Screen>
  );
}
