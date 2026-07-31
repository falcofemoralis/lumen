import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ComponentType, ReactElement } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface FilmPagerHandlers {
  pagerItems: PagerItemInterface[];
  sorting?: DropdownItem[];
  selectedSorting?: Record<string, DropdownItem> | null;
  onPreLoad: (item: PagerItemInterface) => void;
  onNextLoad: (isRefresh: boolean, item: PagerItemInterface) => Promise<void>;
  handleSelectSorting?: (menuItem: MenuItemInterface, item: DropdownItem) => void;
}

export interface FilmPagerContainerProps extends FilmPagerHandlers {
  disableEmptyComponent?: boolean;
  isEmpty?: boolean;
  hideGrid?: boolean;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  // Mobile related
  disableStatusbarSafeArea?: boolean;
  // TV related
  menuDefaultFocus?: boolean;
  // Fires when grid focus enters/leaves the first row, so the screen can
  // collapse its own headers alongside the pager menu.
  onAtTopChange?: (atTop: boolean) => void;
}

export type FilmPagerComponentProps = FilmPagerContainerProps;

export interface PagerItemInterface {
  menuItem: MenuItemInterface;
  films: FilmCardInterface[] | null;
  pagination: PaginationInterface;
}
