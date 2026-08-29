import { ParamListBase, RouteProp } from '@react-navigation/native';
import { FilmPagerHandlers, PagerItemInterface } from 'Component/FilmPager/FilmPager.type';

export interface CategoryScreenContainerProps {
  route: RouteProp<ParamListBase, string>;
}

export interface CategoryScreenComponentProps extends FilmPagerHandlers {
  pagerItems: PagerItemInterface[];
}
