import { Icon, IconPackType } from 'Component/Icon/Icon.type';
import { Href } from 'expo-router';

export enum TabType {
  Search = 'search',
  Home = 'home',
  Bookmarks = 'bookmarks',
  Recent = 'recent',
  Notifications = 'notifications',
  Settings = 'settings',
}

export interface Tab {
  id: TabType;
  route: Href<string>;
  name: string;
  icon: Icon;
  options?: {
    href?: string | null;
  };
}

export interface IgnoredTab {
  name: string;
  options: {
    href: null;
  };
}

export const DEFAULT_TAB = TabType.Home;

export const TABS: Tab[] = [
  {
    id: TabType.Home,
    route: './',
    name: 'Home',
    icon: {
      name: 'home-variant-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    id: TabType.Search,
    route: './search',
    name: 'Search',
    icon: {
      name: 'magnify',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    id: TabType.Bookmarks,
    route: './bookmarks',
    name: 'Bookmarks',
    icon: {
      name: 'movie-star-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    id: TabType.Recent,
    route: './recent',
    name: 'Recent',
    icon: {
      name: 'history',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
  {
    id: TabType.Notifications,
    route: './notifications',
    name: 'Notifications',
    icon: {
      name: 'bell-outline',
      pack: IconPackType.MaterialCommunityIcons,
    },
  },
];

export const TABS_TV: Tab[] = [
  {
    id: TabType.Settings,
    route: './settings',
    name: 'Settings',
    icon: {
      name: 'settings',
      pack: IconPackType.MaterialIcons,
    },
  },
];
