import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo } from 'react';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { queryKeys } from 'Util/Query';

import HomeScreenComponent from './HomeScreen.component';
import HomeScreenComponentTV from './HomeScreen.component.atv';

export function HomeScreenContainer() {
  const { currentService } = useServiceContext();
  const isTV = useIsTV();
  const sortingOptions = useMemo(() => currentService.getFilmSortingOptions(), [currentService]);
  const menuItems = useMemo(() => currentService.getHomeMenu(), [currentService]);

  const handlers = useFilmPager({
    queryKey: queryKeys.films.home(),
    menuItems,
    sorting: sortingOptions,
    fetchFilms: (menuItem: MenuItemInterface, page: number, sort?: string, isRefresh?: boolean) => {
      return currentService.getHomeMenuFilms(menuItem, page, sort, { isRefresh });
    },
  });

  const containerProps = {
    ...handlers,
  };

  return isTV ? <HomeScreenComponentTV { ...containerProps } /> : <HomeScreenComponent { ...containerProps } />;
}

export default HomeScreenContainer;
