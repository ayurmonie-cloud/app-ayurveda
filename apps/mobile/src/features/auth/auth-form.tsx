import { credentialsSchema, type Credentials } from '@ayurmonie/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

type FieldErrors = Partial<Record<keyof Credentials, string>>;

type AuthFormProps = {
  submitLabel: string;
  passwordAutoComplete: 'current-password' | 'new-password';
  onSubmit: (credentials: Credentials) => Promise<void>;
};

export function AuthForm({ submitLabel, passwordAutoComplete, onSubmit }: AuthFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const result = credentialsSchema.safeParse({ email, password });
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof Credentials;
        next[field] ??= t(issue.message as 'auth.invalidEmail' | 'auth.passwordTooShort');
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.form}>
      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label={t('auth.password')}
        hint={passwordAutoComplete === 'new-password' ? t('auth.passwordHint') : undefined}
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete={passwordAutoComplete}
        textContentType={passwordAutoComplete === 'new-password' ? 'newPassword' : 'password'}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Button title={submitLabel} loading={submitting} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.md },
});
