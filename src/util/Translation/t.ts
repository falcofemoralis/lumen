/* eslint-disable vtex/consistent-props-type -- Required */
/* eslint-disable functional/no-let -- Required */
/* eslint-disable no-plusplus -- Required */
/* eslint-disable no-underscore-dangle -- Required */
import i18n from './i18n';

export type TranslationValue = string | undefined;

export function injectValues(string: string, values: TranslationValue[]) {
  let i = 0;

  return string.replace(/%s/g, () => values[i++] ?? '');
}

export function translateString(string: string) {
  return i18n.t(string) || string;
}

export function getTranslatedStringWithInjectedValues(string: string, values: TranslationValue[]) {
  return injectValues(translateString(string), values);
}

export default function t(string: string, ...values: TranslationValue[]) {
  return getTranslatedStringWithInjectedValues(string, values);
}
