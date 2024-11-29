import i18n from './i18n';

export function injectValues(string: string, values: any[]) {
  let i = 0;
  return string.replace(/%s/g, () => values[i++]);
}

export function translateString(string: string) {
  console.log(i18n.t(string));

  return i18n.t(string) || string;
}

export function getTranslatedStringWithInjectedValues(string: string, values: any[]) {
  return injectValues(translateString(string), values);
}

export default function __(string: string, ...values: any[]) {
  return getTranslatedStringWithInjectedValues(string, values);
}
