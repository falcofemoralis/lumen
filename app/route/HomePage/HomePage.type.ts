import { FilmGridPaginationInterface } from 'Component/FilmGrid/FilmGrid.type';
import FilmCardInterface from 'Type/FilmCard.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

export interface HomePageProps {
  films: FilmCardInterface[];
  loadFilms: (
    pagination: FilmGridPaginationInterface,
    isRefresh?: boolean
  ) => Promise<FilmGridPaginationInterface>;
  handleMenuItemChange: (menuItem: MenuItemInterface) => void;
  isLoading: boolean;
  selectedMenuItem: MenuItemInterface;
}
