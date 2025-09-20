import t from 'i18n/t';
import { ACCOUNT_ROUTE } from 'Route/AccountPage/AccountPage.config';
import { BOOKMARKS_ROUTE } from 'Route/BookmarksPage/BookmarksPage.config';
import { HOME_ROUTE } from 'Route/HomePage/HomePage.config';
import { NOTIFICATIONS_ROUTE } from 'Route/NotificationsPage/NotificationsPage.config';
import { RECENT_ROUTE } from 'Route/RecentPage/RecentPage.config';
import { SEARCH_ROUTE } from 'Route/SearchPage/SearchPage.config';

export const SETTINGS_ROUTE = 'Settings';
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
