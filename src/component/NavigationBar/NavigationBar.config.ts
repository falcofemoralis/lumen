import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import t from 'i18n/t';

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
    icon: {
      name: 'bell-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: HOME_ROUTE,
    title: t('Home'),
    icon: {
      name: 'home-variant-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: RECENT_ROUTE,
    title: t('Recent'),
    icon: {
      name: 'history',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: SEARCH_ROUTE,
    title: t('Search'),
    icon: {
      name: 'magnify',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: BOOKMARKS_ROUTE,
    title: t('Bookmarks'),
    icon: {
      name: 'movie-star-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: SETTINGS_ROUTE,
    title: t('Settings'),
    icon: {
      name: 'settings-outline',
      pack: IconPackType.Ionicons,
    },
    position: TAB_POSITION.BOTTOM,
  },
];

export const TABS_MOBILE_CONFIG: Tab[] = [
  {
    route: HOME_ROUTE,
    title: t('Home'),
    icon: {
      name: 'home-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
    iconFocused: {
      name: 'home',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: SEARCH_ROUTE,
    title: t('Search'),
    icon: {
      name: 'search',
      pack: IconPackType.MaterialIcons,
    },
    iconFocused: {
      name: 'saved-search',
      pack: IconPackType.MaterialIcons,
    },
  },
  {
    route: BOOKMARKS_ROUTE,
    title: t('Bookmarks'),
    icon: {
      name: 'movie-star-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
    iconFocused: {
      name: 'movie-star',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: RECENT_ROUTE,
    title: t('Recent'),
    icon: {
      name: 'history',
      pack: IconPackType.MaterialIcons,
    },
    iconFocused: {
      name: 'history',
      pack: IconPackType.MaterialIcons,
    },
  },
  {
    route: ACCOUNT_ROUTE,
    title: t('You'),
    icon: {
      name: 'bell-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
    iconFocused: {
      name: 'bell',
      pack: IconPackType.MaterialCommunityIcons,
    },
    tabComponent: TAB_COMPONENT.ACCOUNT,
  },
];
