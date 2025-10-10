import t from 'i18n/t';
import {
  ACCOUNT_ROUTE,
  BOOKMARKS_ROUTE,
  HOME_ROUTE,
  NOTIFICATIONS_ROUTE,
  RECENT_ROUTE,
  SEARCH_ROUTE,
} from 'Navigation/routes';

export const GITHUB_LINK = 'https://github.com/falcofemoralis/lumen';
export const TELEGRAM_LINK = 'https://t.me/lumen_app';

export const TV_ROUTES = [
  {
    value: ACCOUNT_ROUTE,
    label: t('Account'),
  },
  {
    value: NOTIFICATIONS_ROUTE,
    label: t('Notifications'),
  },
  {
    value: HOME_ROUTE,
    label: t('Home'),
  },
  {
    value: RECENT_ROUTE,
    label: t('Recent'),
  },
  {
    value: SEARCH_ROUTE,
    label: t('Search'),
  },
  {
    value: BOOKMARKS_ROUTE,
    label: t('Bookmarks'),
  },
];

export const MOBILE_ROUTES = [
  {
    value: HOME_ROUTE,
    label: t('Home'),
  },
  {
    value: SEARCH_ROUTE,
    label: t('Search'),
  },
  {
    value: BOOKMARKS_ROUTE,
    label: t('Bookmarks'),
  },
  {
    value: RECENT_ROUTE,
    label: t('Recent'),
  },
  {
    value: ACCOUNT_ROUTE,
    label: t('Account'),
  },
];
