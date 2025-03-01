import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';

import { Tab, TAB_COMPONENT, TAB_POSITION } from './NavigationBar.type';

export const TABS_OPENING_DURATION_TV = 250;

export const TABS_TV_CONFIG: Tab<string>[] = [
  {
    route: 'account',
    title: 'Account',
    icon: {
      name: 'home-variant-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
    position: TAB_POSITION.TOP,
    tabComponent: TAB_COMPONENT.ACCOUNT,
  },
  {
    route: 'notifications',
    title: 'Notifications',
    icon: {
      name: 'bell-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: '(home)',
    title: 'Home',
    icon: {
      name: 'home-variant-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: '(recent)',
    title: 'Recent',
    icon: {
      name: 'history',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: '(search)',
    title: 'Search',
    icon: {
      name: 'magnify',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: '(bookmarks)',
    title: 'Bookmarks',
    icon: {
      name: 'movie-star-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'settings',
    title: 'Settings',
    icon: {
      name: 'settings',
      pack: IconPackType.MaterialIcons,
    },
    position: TAB_POSITION.BOTTOM,
  },
];

export const TABS_MOBILE_CONFIG: Tab<string>[] = [
  {
    route: '(home)',
    title: 'Home',
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
    title: 'Search',
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
    title: 'Bookmarks',
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
    title: 'Recent',
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
    route: 'account',
    title: 'Account',
    icon: {
      name: 'bell-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
    iconFocused: {
      name: 'bell',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
];

export const LOADER_PAGE = 'loader';
