import { resolveLocale, type Locale } from '@ayurmonie/core';
import { createI18nOptions } from '@ayurmonie/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

const STORAGE_KEY = 'ayurmonie.locale';

/** Langue de l'appareil, ramenée à une langue prise en charge (FR, EN, ES). */
export function getDeviceLocale(): Locale {
  return resolveLocale(getLocales().map((locale) => locale.languageTag));
}

const i18n = createInstance();
void i18n.use(initReactI18next).init(createI18nOptions(getDeviceLocale()));

/** Reprend la langue choisie lors d'une session précédente, même avant la connexion. */
export async function restoreLocale(): Promise<void> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (saved && saved !== i18n.language) await i18n.changeLanguage(resolveLocale([saved]));
}

export async function setLocale(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, locale);
  await i18n.changeLanguage(locale);
}

export function currentLocale(): Locale {
  return resolveLocale([i18n.language]);
}

export default i18n;
