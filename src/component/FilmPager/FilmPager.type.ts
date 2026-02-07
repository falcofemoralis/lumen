import { StyleProp, ViewStyle } from 'react-native';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface FilmPagerContainerProps {
  items: PagerItemInterface[];
  loadOnInit?: boolean;
  gridStyle?: StyleProp<ViewStyle>;
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
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
  onNextLoad: (isRefresh: boolean, item: PagerItemInterface) => Promise<void>;
  onPreLoad: (item: PagerItemInterface) => void;
  onRowFocus?: (row: number) => void;
}

export interface PagerItemInterface {
  menuItem: MenuItemInterface;
  films: FilmCardInterface[] | null;
  pagination: PaginationInterface;
}
