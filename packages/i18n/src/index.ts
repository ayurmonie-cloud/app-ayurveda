import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@ayurmonie/core';
import type { InitOptions } from 'i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

/** Le français fait référence : les autres langues doivent avoir exactement les mêmes clés. */
export type Messages = typeof fr;

export const DEFAULT_NAMESPACE = 'translation';

export const resources = {
  fr: { [DEFAULT_NAMESPACE]: fr },
  en: { [DEFAULT_NAMESPACE]: en satisfies Messages },
  es: { [DEFAULT_NAMESPACE]: es satisfies Messages },
} as const satisfies Record<Locale, Record<typeof DEFAULT_NAMESPACE, Messages>>;

/** Options i18next communes à l'app et à l'admin. */
export function createI18nOptions(lng: Locale): InitOptions {
  return {
    lng,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: DEFAULT_NAMESPACE,
    resources,
    interpolation: { escapeValue: false },
    returnNull: false,
  };
}

export { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale };
