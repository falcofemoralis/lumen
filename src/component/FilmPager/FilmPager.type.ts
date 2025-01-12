import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface FilmPagerContainerProps {
  menuItems: MenuItemInterface[];
  filmPager: FilmPagerInterface;
  loadOnInit?: boolean;
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => Promise<FilmListInterface>;
  onUpdateFilms: (key: string, filmList: FilmListInterface) => void;
}

export interface FilmPagerComponentProps {
  pagerItems: PagerItemInterface[];
  selectedPagerItem: PagerItemInterface;
  isLoading: boolean;
  onNextLoad: (isRefresh: boolean) => Promise<void>;
  handleMenuItemChange: (pagerItem: PagerItemInterface) => void;
}

export interface PagerItemInterface {
  key: string;
  title: string;
  menuItem: MenuItemInterface;
  films: FilmCardInterface[] | null;
  pagination: PaginationInterface;
}

export interface FilmPagerInterface {
  [key: string]: {
    filmList: FilmListInterface;
  } | undefined;
}
