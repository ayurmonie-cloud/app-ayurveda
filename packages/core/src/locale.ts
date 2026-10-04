import { z } from 'zod';

/** Langues proposées au lancement. Le français est la langue de référence des contenus. */
export const SUPPORTED_LOCALES = ['fr', 'en', 'es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

export const localeSchema = z.enum(SUPPORTED_LOCALES);

export function isSupportedLocale(value: unknown): value is Locale {
  return localeSchema.safeParse(value).success;
}

/**
 * Choisit la première langue prise en charge parmi celles préférées par l'appareil
 * (codes BCP 47 comme « es-MX »), sinon la langue par défaut.
 */
export function resolveLocale(preferred: readonly (string | null | undefined)[]): Locale {
  for (const tag of preferred) {
    const language = tag?.toLowerCase().split(/[-_]/)[0];
    if (isSupportedLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}

/** Texte traduit tel qu'il est stocké en base (colonne jsonb `localized_text`). */
export type LocalizedText = Partial<Record<Locale, string>>;

export const localizedTextSchema = z
  .object({ fr: z.string().min(1), en: z.string().optional(), es: z.string().optional() })
  .strict();

/**
 * Renvoie le texte dans la langue demandée, en retombant sur le français
 * puis sur n'importe quelle traduction disponible.
 */
export function localize(text: LocalizedText | null | undefined, locale: Locale): string {
  if (!text) return '';
  return (
    nonEmpty(text[locale]) ??
    nonEmpty(text[DEFAULT_LOCALE]) ??
    SUPPORTED_LOCALES.map((l) => nonEmpty(text[l])).find(Boolean) ??
    ''
  );
}

function nonEmpty(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value : undefined;
}
