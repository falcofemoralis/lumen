import { FilmPagerHandlers } from 'Component/FilmPager/FilmPager.type';
import { TabPosition } from '../../config';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { MutableRefObject } from 'react';

export interface BookmarksScreenComponentProps extends FilmPagerHandlers {
  isLoading: boolean;
  tabPosition: TabPosition;
  isLocalLibrary: boolean;
  manageCategoriesOverlayRef: MutableRefObject<ThemedOverlayRef | null>;
  openManageCategories: () => void;
}
