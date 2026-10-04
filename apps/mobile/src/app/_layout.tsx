import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { useProfile } from '@/hooks/use-profile';
// Importer ce module initialise i18next avant le premier rendu.
import { restoreLocale, setLocale } from '@/lib/i18n';
import { AppProviders } from '@/providers/app-providers';
import { useAuth } from '@/providers/auth-provider';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppProviders>
        <RootNavigator />
        <StatusBar style="auto" />
      </AppProviders>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const [localeReady, setLocaleReady] = useState(false);
  const profile = useProfile();

  useEffect(() => {
    void restoreLocale().finally(() => setLocaleReady(true));
  }, []);

  // Une fois connecté, la langue enregistrée dans le profil fait foi sur tous les appareils.
  const profileLocale = profile.data?.locale;
  useEffect(() => {
    if (profileLocale) void setLocale(profileLocale);
  }, [profileLocale]);

  const ready = !isLoading && localeReady;
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
