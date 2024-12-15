import FilmCardInterface from './FilmCard.interface';
import { MenuItemInterface } from './MenuItem.interface';
import { PaginationInterface } from './Pagination.interface';

export interface PagerItemInterface {
  key: number;
  menuItem: MenuItemInterface;
  films: FilmCardInterface[] | null;
  pagination: PaginationInterface;
}
