import { PagerItemInterface, PagerItemsInterface } from 'Component/FilmPager/FilmPager.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { MutableRefObject } from 'react';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

export interface BookmarksScreenComponentProps {
  isLoading: boolean;
  pagerItems: PagerItemsInterface;
  isLocalLibrary: boolean;
  manageCategoriesOverlayRef: MutableRefObject<ThemedOverlayRef | null>;
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => Promise<FilmListInterface>;
  onUpdateFilms: (
    key: string,
    item: PagerItemInterface
  ) => void;
  openManageCategories: () => void;
}
