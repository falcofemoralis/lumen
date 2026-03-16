import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

export interface HomeScreenComponentProps {
  pagerItems: PagerItemInterface[];
  sorting: DropdownItem[];
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => Promise<FilmListInterface>;
  onUpdateFilms: (
    key: string,
    item: PagerItemInterface
  ) => void;
}
