import { IconInterface, IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import { Href, RelativePathString } from 'expo-router';

export interface Tab<T> {
  route: T;
  title: string;
  icon?: IconInterface;
  isDefault?: boolean;
  options?: {
    href?: RelativePathString | null;
  };
}

export const TABS_TV_CONFIG: Tab<string>[] = [
  {
    isDefault: true,
    route: 'index',
    title: 'Home',
    icon: {
      name: 'home-variant-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'search',
    title: 'Search',
    icon: {
      name: 'magnify',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'bookmarks',
    title: 'Bookmarks',
    icon: {
      name: 'movie-star-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'recent',
    title: 'Recent',
    icon: {
      name: 'history',
      pack: IconPackType.MaterialCommunityIcons,
    },
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
    route: 'settings',
    title: 'Settings',
    icon: {
      name: 'settings',
      pack: IconPackType.MaterialIcons,
    },
  },
];

const TABS_MOBILE_IGNORED_TABS: string[] = [
  'player/[data]',
  'settings',
  'notifications',
  'film/[link]',
];

export const TABS_MOBILE_CONFIG: Tab<string>[] = [
  {
    route: 'index',
    title: 'Home',
    icon: {
      name: 'home-variant-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'search',
    title: 'Search',
    icon: {
      name: 'magnify',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'bookmarks',
    title: 'Bookmarks',
    icon: {
      name: 'movie-star-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'recent',
    title: 'Recent',
    icon: {
      name: 'history',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    route: 'account',
    title: 'Account',
    icon: {
      name: 'bell-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  ...TABS_MOBILE_IGNORED_TABS.map((route) => ({
    route,
    title: route,
    options: {
      href: null,
    },
  })),
];
