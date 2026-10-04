import type { DEFAULT_NAMESPACE, Messages } from '@ayurmonie/i18n';

// Clés de traduction typées : `t('auth.signIn')` est vérifié à la compilation.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NAMESPACE;
    resources: { translation: Messages };
  }
}
