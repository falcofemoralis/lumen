import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '../../../i18n/en-US.json';
import uk from '../../../i18n/uk-UA.json';

const i18n = new I18n({
  en,
  uk,
});

i18n.locale = getLocales()[0].languageCode ?? 'en';

export default i18n;
