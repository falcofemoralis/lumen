import {
  ASPECT_RATIO_OPTIONS,
  DEFAULT_SPEEDS,
  getAspectRatioLabel,
  MAX_QUALITY,
  SUBTITLES_BOTTOM_OFFSETS,
  SUBTITLES_SIZE_SCALES,
} from 'Component/Player/Player.config';
import { t } from 'i18n/translate';
import { SubtitleEdgeType } from 'Modules/react-native-subtitle-style';
import {
  ACCOUNT_SCREEN,
  BOOKMARKS_SCREEN,
  HOME_SCREEN,
  NOTIFICATIONS_SCREEN,
  RECENT_SCREEN,
  SEARCH_SCREEN,
} from 'Navigation/navigationRoutes';

export const GITHUB_LINK = 'https://github.com/falcofemoralis/lumen';
export const TELEGRAM_LINK = 'https://t.me/lumen_app';

/**
 * Every label in this file is read through a getter rather than being translated where
 * the constant is declared. The module body runs while it is imported, which is before
 * `initI18n()` gets to run, so an eager `t()` would freeze the untranslated key - and a
 * getter is also what keeps the label right once the language is changed.
 */
export const TV_SCREENS = [
  {
    value: ACCOUNT_SCREEN,
    get label() {
      return t('Account');
    },
  },
  {
    value: NOTIFICATIONS_SCREEN,
    get label() {
      return t('Notifications');
    },
  },
  {
    value: HOME_SCREEN,
    get label() {
      return t('Home');
    },
  },
  {
    value: RECENT_SCREEN,
    get label() {
      return t('Recent');
    },
  },
  {
    value: SEARCH_SCREEN,
    get label() {
      return t('Search');
    },
  },
  {
    value: BOOKMARKS_SCREEN,
    get label() {
      return t('Bookmarks');
    },
  },
];

export const MOBILE_SCREENS = [
  {
    value: HOME_SCREEN,
    get label() {
      return t('Home');
    },
  },
  {
    value: SEARCH_SCREEN,
    get label() {
      return t('Search');
    },
  },
  {
    value: BOOKMARKS_SCREEN,
    get label() {
      return t('Bookmarks');
    },
  },
  {
    value: RECENT_SCREEN,
    get label() {
      return t('Recent');
    },
  },
  {
    value: ACCOUNT_SCREEN,
    get label() {
      return t('Account');
    },
  },
];

export const THEME_SCHEME_OPTIONS = [
  {
    value: 'system',
    get label() {
      return t('System default');
    },
  },
  {
    value: 'dark',
    get label() {
      return t('Dark');
    },
  },
  {
    value: 'light',
    get label() {
      return t('Light');
    },
  },
];

export const APP_LANGUAGE_OPTIONS = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
];

export const FILM_COUNTRY_OPTIONS = [
  'Россия',
  'СССР',
  'США',
  'Франция',
  'Италия',
  'Испания',
  'Великобритания',
  'Германия',
  'Турция',
  'Корея Южная',
  'Япония',
  'Австралия',
  'Австрия',
  'Азербайджан',
  'Албания',
  'Алжир',
  'Ангола',
  'Андорра',
  'Аргентина',
  'Армения',
  'Аруба',
  'Афганистан',
  'Багамы',
  'Бангладеш',
  'Барбадос',
  'Бахрейн',
  'Беларусь',
  'Белиз',
  'Бельгия',
  'Бермуды',
  'Болгария',
  'Боливия',
  'Босния и Герцеговина',
  'Ботсвана',
  'Бразилия',
  'Буркина-Фасо',
  'Бутан',
  'Вануату',
  'Ватикан',
  'Венгрия',
  'Венесуэла',
  'Вьетнам',
  'Вьетнам Северный',
  'Гаити',
  'Гана',
  'Гваделупа',
  'Гватемала',
  'Германия (ГДР)',
  'Германия (ФРГ)',
  'Гондурас',
  'Гонконг',
  'Гренландия',
  'Греция',
  'Грузия',
  'Дания',
  'Доминикана',
  'Египет',
  'Замбия',
  'Зимбабве',
  'Израиль',
  'Индия',
  'Индонезия',
  'Иордания',
  'Ирак',
  'Иран',
  'Ирландия',
  'Исландия',
  'Йемен',
  'Казахстан',
  'Каймановы острова',
  'Камбоджа',
  'Камерун',
  'Канада',
  'Катар',
  'Кения',
  'Кипр',
  'Китай',
  'Колумбия',
  'Конго',
  'Корея',
  'Корея Северная',
  'Косово',
  'Коста-Рика',
  'Кот-д’Ивуар',
  'Куба',
  'Кувейт',
  'Кыргызстан',
  'Лаос',
  'Латвия',
  'Лесото',
  'Ливан',
  'Ливия',
  'Литва',
  'Лихтенштейн',
  'Люксембург',
  'Маврикий',
  'Мавритания',
  'Мадагаскар',
  'Макао',
  'Македония',
  'Малайзия',
  'Мальта',
  'Марокко',
  'Мексика',
  'Молдова',
  'Монако',
  'Монголия',
  'Намибия',
  'Непал',
  'Нигерия',
  'Нидерланды',
  'Никарагуа',
  'Новая Зеландия',
  'Норвегия',
  'ОАЭ',
  'Остров Мэн',
  'Остров Святой Елены',
  'Пакистан',
  'Палестина',
  'Панама',
  'Папуа - Новая Гвинея',
  'Парагвай',
  'Перу',
  'Польша',
  'Португалия',
  'Пуэрто Рико',
  'Реюньон',
  'Российская империя',
  'Руанда',
  'Румыния',
  'Сальвадор',
  'Саудовская Аравия',
  'Северная Македония',
  'Сенегал',
  'Сент-Китс и Невис',
  'Сербия',
  'Сербия и Черногория',
  'Сингапур',
  'Сирия',
  'Словакия',
  'Словения',
  'Сомали',
  'Судан',
  'Таджикистан',
  'Таиланд',
  'Тайвань',
  'Танзания',
  'Тринидад и Тобаго',
  'Тунис',
  'Туркменистан',
  'Уганда',
  'Узбекистан',
  'Украина',
  'Уругвай',
  'Фарерские острова',
  'Фиджи',
  'Филиппины',
  'Финляндия',
  'Французская Полинезия',
  'Хорватия',
  'Чад',
  'Черногория',
  'Чехия',
  'Чехословакия',
  'Чили',
  'Швейцария',
  'Швеция',
  'Шри-Ланка',
  'Эквадор',
  'Эстония',
  'Эфиопия',
  'ЮАР',
  'Югославия',
  'Югославия (ФР)',
  'Ямайка',
].map((country) => ({ value: country, label: country }));

export const COLUMNS_MOBILE_OPTIONS = Array.from({ length: 9 }, (_, index) => ({
  value: (index + 2).toString(),
  label: (index + 2).toString(),
}));

export const COLUMNS_TV_OPTIONS = Array.from({ length: 11 }, (_, index) => ({
  value: (index + 2).toString(),
  label: (index + 2).toString(),
}));

export const PLAYER_QUALITY_OPTIONS = [
  MAX_QUALITY,
  { value: '4K', label: '4K' },
  { value: '2K', label: '2K' },
  { value: '1080p Ultra', label: '1080p Ultra' },
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
  { value: '360p', label: '360p' },
];

export const PLAYER_REWIND_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const value = (index + 1) * 5;

  return {
    value: value.toString(),
    get label() {
      return t('{{seconds}} seconds', { seconds: value });
    },
  };
});

export const PLAYER_ASPECT_RATIO_OPTIONS = ASPECT_RATIO_OPTIONS.map((option) => ({
  value: option,
  get label() {
    return getAspectRatioLabel(option);
  },
}));

export const PLAYER_LONG_PRESS_SPEED_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const value = (index + 1) * 0.25;

  return {
    value: value.toString(),
    label: `${value.toString()}x`,
  };
});

export const PLAYER_SPEED_OPTIONS = DEFAULT_SPEEDS.map((value) => ({
  value: value.toString(),
  label: `${value.toString()}x`,
}));

export const PLAYER_BUFFER_TIME_OPTIONS = [
  {
    value: 'auto',
    get label() {
      return t('Auto');
    },
  },
  ...Array.from({ length: 12 }, (_, index) => {
    const value = (index + 1) * 15;

    return {
      value: value.toString(),
      get label() {
        return t('{{seconds}} seconds', { seconds: value });
      },
    };
  }),
];

export const PLAYER_BACK_BUFFER_TIME_OPTIONS = [
  {
    value: '0',
    get label() {
      return t('Off');
    },
  },
  ...Array.from({ length: 12 }, (_, index) => {
    const value = (index + 1) * 15;

    return {
      value: value.toString(),
      get label() {
        return t('{{seconds}} seconds', { seconds: value });
      },
    };
  }),
];

// Both of these are relative to the height of the player rather than absolute, so they
// are shown as what they are: 100% is the size the player draws by default, and the
// offset is how much of the picture stands between the subtitles and its bottom edge.
export const PLAYER_SUBTITLES_SIZE_OPTIONS = SUBTITLES_SIZE_SCALES.map((scale) => ({
  value: scale.toString(),
  label: `${Math.round(scale * 100)}%`,
}));

export const PLAYER_SUBTITLES_BOTTOM_OFFSET_OPTIONS = SUBTITLES_BOTTOM_OFFSETS.map((offset) => ({
  value: offset.toString(),
  label: `${Math.round(offset * 100)}%`,
}));

// #AARRGGBB, i.e. the alpha comes first - the native side hands these to
// `Color.parseColor`, which reads them the Android way rather than the CSS way.
export const PLAYER_SUBTITLES_COLOR_OPTIONS = [
  {
    value: '#FFFFFF',
    get label() {
      return t('White');
    },
  },
  {
    value: '#FFFF00',
    get label() {
      return t('Yellow');
    },
  },
  {
    value: '#00FFFF',
    get label() {
      return t('Cyan');
    },
  },
  {
    value: '#00FF00',
    get label() {
      return t('Green');
    },
  },
  {
    value: '#BFBFBF',
    get label() {
      return t('Grey');
    },
  },
  {
    value: '#000000',
    get label() {
      return t('Black');
    },
  },
];

export const PLAYER_SUBTITLES_BACKGROUND_OPTIONS = [
  {
    value: '#00000000',
    get label() {
      return t('None');
    },
  },
  {
    value: '#80000000',
    get label() {
      return t('Translucent black');
    },
  },
  {
    value: '#FF000000',
    get label() {
      return t('Black');
    },
  },
  {
    value: '#80808080',
    get label() {
      return t('Translucent grey');
    },
  },
  {
    value: '#FFFFFFFF',
    get label() {
      return t('White');
    },
  },
];

export const PLAYER_SUBTITLES_EDGE_OPTIONS = [
  {
    value: SubtitleEdgeType.NONE,
    get label() {
      return t('None');
    },
  },
  {
    value: SubtitleEdgeType.OUTLINE,
    get label() {
      return t('Outline');
    },
  },
  {
    value: SubtitleEdgeType.DROP_SHADOW,
    get label() {
      return t('Drop shadow');
    },
  },
  {
    value: SubtitleEdgeType.RAISED,
    get label() {
      return t('Raised');
    },
  },
  {
    value: SubtitleEdgeType.DEPRESSED,
    get label() {
      return t('Depressed');
    },
  },
];
