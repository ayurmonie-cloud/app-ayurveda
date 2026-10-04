import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuration Expo. Les identifiants des stores sont à confirmer avec le nom
 * définitif de l'app (voir docs/setup.md).
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Ayurmonie',
  slug: 'ayurmonie',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'ayurmonie',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.ayurmonie.app',
    supportsTablet: true,
    config: { usesNonExemptEncryption: false },
  },
  android: {
    package: 'com.ayurmonie.app',
    adaptiveIcon: {
      backgroundColor: '#F4EDE4',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F4EDE4',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
});
