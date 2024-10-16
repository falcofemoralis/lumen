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
  icon: string;
}

export const TABS: Tab[] = [
  {
    id: TabType.Search,
    route: './film',
    name: 'Search',
    icon: 'home-variant-outline',
  },
  {
    id: TabType.Home,
    route: './',
    name: 'Home',
    icon: 'home-variant-outline',
  },
  // {
  //   id: TabType.Bookmarks,
  //   route: './',
  //   name: 'Bookmarks',
  //   icon: 'home-variant-outline',
  // },
  // {
  //   id: TabType.Recent,
  //   route: './film',
  //   name: 'Recent',
  //   icon: 'home-variant-outline',
  // },
  // {
  //   id: TabType.Notifications,
  //   route: './',
  //   name: 'Notifications',
  //   icon: 'home-variant-outline',
  // },
  // {
  //   id: TabType.Settings,
  //   route: './film',
  //   name: 'Settings',
  //   icon: 'home-variant-outline',
  // },
];

export const DEFAULT_TAB = TabType.Home;
