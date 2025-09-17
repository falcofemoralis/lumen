import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useState } from 'react';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import HomePageComponent from './HomePage.component';
import HomePageComponentTV from './HomePage.component.atv';

export function HomePageContainer() {
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});
  const { currentService } = useServiceContext();

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

  const containerProps = () => ({
    menuItems: getMenuItems(),
    filmPager,
  });

  const containerFunctions = {
    onLoadFilms,
    onUpdateFilms,
  };

  return withTV(HomePageComponentTV, HomePageComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default HomePageContainer;
