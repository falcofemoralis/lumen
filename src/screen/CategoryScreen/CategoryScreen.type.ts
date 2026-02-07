import { ParamListBase, RouteProp } from '@react-navigation/native';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

export interface CategoryScreenContainerProps {
  route: RouteProp<ParamListBase, string>;
}

export interface CategoryScreenComponentProps {
  pagerItems: PagerItemInterface[];
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
