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
  const { getCurrentService } = useServiceContext();

  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean,
  ) => getCurrentService().getHomeMenuFilms(menuItem, currentPage, {
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

  const getMenuItems = () => getCurrentService().getHomeMenu();

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
