import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { FilmDisplayMode, TabPosition } from '../../config';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface FilmPagerHandlers {
  displayMode?: FilmDisplayMode;
  pagerItems: PagerItemInterface[];
  sorting?: DropdownItem[];
  selectedSorting?: Record<string, DropdownItem> | null;
  initialPage?: number;
  onPreLoad: (item: PagerItemInterface) => void;
  onNextLoad: (isRefresh: boolean, item: PagerItemInterface) => Promise<void>;
  handleSelectSorting?: (menuItem: MenuItemInterface, item: DropdownItem) => void;
}

export interface FilmPagerContainerProps extends FilmPagerHandlers {
  /** Optional screen content inside a mobile pager tab. */
  renderPageContent?: (item: PagerItemInterface, index: number) => ReactNode;
  disableEmptyComponent?: boolean;
  isEmpty?: boolean;
  hideGrid?: boolean;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  /** Center the empty component in the grid instead of leaving it at the top. */
  centerEmptyComponent?: boolean;
  // Mobile related
  disableStatusbarSafeArea?: boolean;
  // TV related
  menuDefaultFocus?: boolean;
  tabPosition?: TabPosition;
  TabBarActionComponent?: ReactNode;
  /** Optional right padding for the tab bar outer container. */
  tabBarRightPadding?: number;
  /** Optional focusable control rendered after the TV tab list. */
  menuTrailingComponent?: ReactNode;
  // Fires when grid focus enters/leaves the first row, so the screen can
  // collapse its own headers alongside the pager menu.
  onAtTopChange?: (atTop: boolean) => void;
  /** Shows a floating button that scrolls the active tab's grid back to the top. */
  showScrollToTopButton?: boolean;
}

export type FilmPagerComponentProps = FilmPagerContainerProps;

export interface PagerItemInterface {
  menuItem: MenuItemInterface;
  displayTitle?: string;
  films: FilmCardInterface[] | null;
  pagination: PaginationInterface;
}
