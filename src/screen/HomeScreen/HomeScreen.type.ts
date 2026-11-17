import { FilmPagerHandlers } from 'Component/FilmPager/FilmPager.type';
import { TabPosition } from '../../config';

export interface HomeScreenComponentProps extends FilmPagerHandlers {
  tabPosition: TabPosition;
}
