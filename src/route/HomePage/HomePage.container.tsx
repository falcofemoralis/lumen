import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import RecentStore from 'Store/Recent.store';
import ServiceStore from 'Store/Service.store';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import HomePageComponent from './HomePage.component';
import HomePageComponentTV from './HomePage.component.atv';

export function HomePageContainer() {
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});

  useEffect(() => {
    if (ServiceStore.isSignedIn && !RecentStore.isPreloaded) {
      RecentStore.preloadData();
    }
  }, []);

  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean,
  ) => ServiceStore.getCurrentService().getHomeMenuFilms(menuItem, currentPage, {
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

  const getMenuItems = () => ServiceStore.getCurrentService().getHomeMenu();

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

export default observer(HomePageContainer);
