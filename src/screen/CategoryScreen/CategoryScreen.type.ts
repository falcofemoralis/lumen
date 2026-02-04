import { ParamListBase, RouteProp } from '@react-navigation/native';
import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

export interface CategoryScreenContainerProps {
  route: RouteProp<ParamListBase, string>;
}

export interface CategoryScreenComponentProps {
  filmPager: FilmPagerInterface;
  onLoadFilms: (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => Promise<FilmListInterface>;
  onUpdateFilms: (key: string, filmList: FilmListInterface) => void;
}
