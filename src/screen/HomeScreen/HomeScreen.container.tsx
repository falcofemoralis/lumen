import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useState } from 'react';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import HomeScreenComponent from './HomeScreen.component';
import HomeScreenComponentTV from './HomeScreen.component.atv';

export function HomeScreenContainer() {
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});
  const { currentService } = useServiceContext();
  const { isTV } = useConfigContext();

  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => currentService.getHomeMenuFilms(menuItem, currentPage, {
    isRefresh,
  });

  const onUpdateFilms = async (key: string, filmList: FilmListInterface) => {
    setFilmPager((prevFilmPager) => ({
      ...prevFilmPager,
      [key]: {
        filmList,
      },
    }));
  };

  const getMenuItems = () => currentService.getHomeMenu();

  const containerProps = {
    menuItems: getMenuItems(),
    filmPager,
    onLoadFilms,
    onUpdateFilms,
  };

  return isTV ? <HomeScreenComponentTV { ...containerProps } /> : <HomeScreenComponent { ...containerProps } />;
}

export default HomeScreenContainer;
