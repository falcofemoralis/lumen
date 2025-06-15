import t from 'i18n/t';
import { Bell, FolderHeart, History,House, Search, Settings } from 'lucide-react-native';

import {
  NavigationRoute,
  Tab,
  TAB_COMPONENT,
  TAB_POSITION,
} from './NavigationBar.type';

export const ACCOUNT_ROUTE: NavigationRoute = '(account)';
export const BOOKMARKS_ROUTE: NavigationRoute = '(bookmarks)';
export const RECENT_ROUTE: NavigationRoute = '(recent)';
export const SEARCH_ROUTE: NavigationRoute = '(search)';
export const HOME_ROUTE: NavigationRoute = '(+home)';
export const NOTIFICATIONS_ROUTE: NavigationRoute = '(notifications)';
export const SETTINGS_ROUTE: NavigationRoute = 'settings';
export const LOADER_ROUTE: NavigationRoute = 'loader';

export const DEFAULT_ROUTE: NavigationRoute = HOME_ROUTE;

export const TABS_TV_CONFIG: Tab[] = [
  {
    route: ACCOUNT_ROUTE,
    title: t('You'),
    position: TAB_POSITION.TOP,
    tabComponent: TAB_COMPONENT.ACCOUNT,
  },
  {
    route: NOTIFICATIONS_ROUTE,
    title: t('Notifications'),
    IconComponent: Bell,
  },
  {
    route: HOME_ROUTE,
    title: t('Home'),
    IconComponent: House,
  },
  {
    route: RECENT_ROUTE,
    title: t('Recent'),
    IconComponent: History,
  },
  {
    route: SEARCH_ROUTE,
    title: t('Search'),
    IconComponent: Search,
  },
  {
    route: BOOKMARKS_ROUTE,
    title: t('Bookmarks'),
    IconComponent: FolderHeart,
  },
  {
    route: SETTINGS_ROUTE,
    title: t('Settings'),
    position: TAB_POSITION.BOTTOM,
    IconComponent: Settings,
  },
];

export const TABS_MOBILE_CONFIG: Tab[] = [
  {
    route: HOME_ROUTE,
    title: t('Home'),
    IconComponent: House,
  },
  {
    route: SEARCH_ROUTE,
    title: t('Search'),
    IconComponent: Search,
  },
  {
    route: BOOKMARKS_ROUTE,
    title: t('Bookmarks'),
    IconComponent: FolderHeart,
  },
  {
    route: RECENT_ROUTE,
    title: t('Recent'),
    IconComponent: History,
  },
  {
    route: ACCOUNT_ROUTE,
    title: t('You'),
    tabComponent: TAB_COMPONENT.ACCOUNT,
  },
];
