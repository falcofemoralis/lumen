import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface FilmPagerContainerProps {
  menuItems: MenuItemInterface[];
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => Promise<FilmListInterface>;
}

export interface FilmPagerComponentProps {
  pagerItems: PagerItemInterface[];
  selectedPagerItem: PagerItemInterface;
  isLoading: boolean;
  onNextLoad: (
    pagination: PaginationInterface,
    isRefresh?: boolean,
    isUpdate?: boolean
  ) => Promise<void>;
  handleMenuItemChange: (pagerItem: PagerItemInterface) => void;
}

export interface PagerItemInterface {
  key: string;
  title: string;
  menuItem: MenuItemInterface;
  films: FilmCardInterface[] | null;
  pagination: PaginationInterface;
}
