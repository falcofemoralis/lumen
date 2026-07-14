import 'intl-pluralrules';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from 'Util/Storage';

// if English isn't your default language, move Translations to the appropriate language file.
import en, { Translations } from './en';
import ru from './ru';
import uk from './uk';

const fallbackLocale = 'en';
const STORAGE_KEY = 'user-language';

export const transformKey = (key: string) => key.replace(/\s/g, '_').replace(/[!?,.:]/g, '_');

const convertResource = (obj: Record<string, string>) => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [transformKey(key), value]));
};

const resources = {
  en: { general: convertResource(en) },
  ru: { general: convertResource(ru) },
  uk: { general: convertResource(uk) },
};

/**
 * Get stored user language
 */
export const getStoredLanguage = (): string => {
  try {
    const savedLanguage = storage.getConfigStorage().loadString(STORAGE_KEY);
    if (savedLanguage && Object.keys(resources).includes(savedLanguage)) {
      return savedLanguage;
    }
  } catch (error) {
    console.error('Error reading language from storage:', error);
  }

  return fallbackLocale;
};

/**
 * Function to change language in the app and save it
 */
export const setLanguage = async (lang: 'en' | 'ru' | 'uk') => {
  try {
    storage.getConfigStorage().saveString(STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error('Error saving language to storage:', error);
  }
};

export const initI18n = async () => {
  i18n.use(initReactI18next);

  const savedLng = getStoredLanguage();

  await i18n.init({
    resources,
    lng: savedLng,
    fallbackLng: fallbackLocale,
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
};

/**
 * Builds up valid keypaths for translations.
 */
export type TxKeyPath = RecursiveKeyOf<Translations>

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, true>
}[keyof TObj & (string | number)]

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, false>
}[keyof TObj & (string | number)]

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean,
> = TValue extends any[]
  ? Text
  : TValue extends object
    ? IsFirstLevel extends true
      ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
      : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
    : Text