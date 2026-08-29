import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { useConfigContext, useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo } from 'react';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { queryKeys } from 'Util/Query';

import HomeScreenComponent from './HomeScreen.component';
import HomeScreenComponentTV from './HomeScreen.component.atv';

export function HomeScreenContainer() {
  const { currentService } = useServiceContext();
  const { homeDefaultTab } = useConfigContext();
  const isTV = useIsTV();
  const sortingOptions = useMemo(() => currentService.getFilmSortingOptions(), [currentService]);
  const menuItems = useMemo(() => currentService.getHomeMenu(), [currentService]);

  // the configured tab can be missing after a provider change, so it falls back to the first one
  const initialIndex = useMemo(() => {
    const index = menuItems.findIndex(({ id }) => id === homeDefaultTab);

    return index === -1 ? 0 : index;
  }, [menuItems, homeDefaultTab]);

  const handlers = useFilmPager({
    queryKey: queryKeys.films.home(),
    menuItems,
    sorting: sortingOptions,
    initialIndex,
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
