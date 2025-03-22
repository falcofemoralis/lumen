import { I18n } from 'i18n-js';

import en from '../../../i18n/en-US.json';
import ru from '../../../i18n/ru-RU.json';

const i18n = new I18n({
  en,
  ru,
}, {
  missingBehavior: 'guess',
  defaultSeparator: '][',
});

i18n.locale = 'ru'; // getLocales()[0].languageCode ??

export function changeLanguage(lang: string) {
  i18n.locale = lang;
}

export default i18n;
