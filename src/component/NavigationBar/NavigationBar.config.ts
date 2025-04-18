import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import t from 'i18n/t';

import {
  NavigationRoute,
  Tab,
  TAB_COMPONENT,
  TAB_POSITION,
} from './NavigationBar.type';

export const TABS_OPENING_DURATION_TV = 250;

export const DEFAULT_ROUTE: NavigationRoute = '(+home)';

export const TABS_TV_CONFIG: Tab[] = [
  {
    route: '(account)',
    title: t('You'),
    icon: {
      name: 'home-variant-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
    position: TAB_POSITION.TOP,
    tabComponent: TAB_COMPONENT.ACCOUNT,
  },
  {
    route: '(notifications)',
    title: t('Notifications'),
    icon: {
      name: 'bell-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: '(+home)',
    title: t('Home'),
    icon: {
      name: 'home-variant-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: '(recent)',
    title: t('Recent'),
    icon: {
      name: 'history',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: '(search)',
    title: t('Search'),
    icon: {
      name: 'magnify',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: '(bookmarks)',
    title: t('Bookmarks'),
    icon: {
      name: 'movie-star-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'settings',
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
    route: '(+home)',
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
    route: '(search)',
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
    route: '(bookmarks)',
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
    route: '(recent)',
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
    route: '(account)',
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

export const LOADER_PAGE = 'loader';
