import { MenuItemInterface } from 'Type/MenuItem.interface';

export const SEARCH_MENU_ITEM: MenuItemInterface = {
  id: 'search',
  title: 'Search',
  path: '/search',
  key: 'search',
  isHidden: true,
};

export const SEARCH_DEBOUNCE_TIME = 500;
export const USER_SUGGESTIONS = 'suggestions';
export const MAX_USER_SUGGESTIONS = 10;
