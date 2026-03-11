import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { StyleProp, ViewStyle } from 'react-native';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface FilmPagerContainerProps {
  items: PagerItemInterface[];
  loadOnInit?: boolean;
  gridStyle?: StyleProp<ViewStyle>;
  isGridVisible?: boolean;
  isEmpty?: boolean;
  isAddSafeArea?: boolean;
  sorting?: DropdownItem[];
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean,
    sort?: string
  ) => Promise<FilmListInterface>;
  onUpdateFilms: (
    key: string,
    item: PagerItemInterface
  ) => void;
  onRowFocus?: (row: number) => void;
}

export interface FilmPagerComponentProps {
  items: PagerItemInterface[];
  gridStyle?: StyleProp<ViewStyle>;
  isGridVisible?: boolean;
  isEmpty?: boolean;
  isAddSafeArea?: boolean;
  sorting?: DropdownItem[];
  selectedSorting?: Record<string, DropdownItem> | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
  onNextLoad: (isRefresh: boolean, item: PagerItemInterface) => Promise<void>;
  onPreLoad: (item: PagerItemInterface) => void;
  onRowFocus?: (row: number) => void;
  handleSelectSorting: (menuItem: PagerItemInterface['menuItem'], item: DropdownItem) => void;
}

export interface PagerItemInterface {
  menuItem: MenuItemInterface;
  films: FilmCardInterface[] | null;
  pagination: PaginationInterface;
}
