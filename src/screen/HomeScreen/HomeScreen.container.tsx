import { pagerItemsReset, pagerItemsUpdater } from 'Component/FilmPager/FilmPager.config';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo, useState } from 'react';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import HomeScreenComponent from './HomeScreen.component';
import HomeScreenComponentTV from './HomeScreen.component.atv';

export function HomeScreenContainer() {
  const { currentService } = useServiceContext();
  const { isTV } = useConfigContext();
  const sorting = useMemo(() => currentService.getFilmSortingOptions(), [currentService]);

  const [pagerItems, setPagerItems] = useState<PagerItemInterface[]>(currentService
    .getHomeMenu()
    .reduce((acc, menuItem) => {
      acc.push({
        menuItem,
        films: null,
        pagination: {
          currentPage: 1,
          totalPages: 1,
        },
      });

      return acc;
    }, [] as PagerItemInterface[]));

  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean,
    sort?: string
  ) => {
    if (isRefresh) {
      setPagerItems(pagerItemsReset(menuItem.id));
    }

    return currentService.getHomeMenuFilms(menuItem, currentPage, sort, {
      isRefresh,
    });
  };

  const onUpdateFilms = (key: string, item: PagerItemInterface) => {
    setPagerItems(pagerItemsUpdater(key, item));
  };

  const containerProps = {
    pagerItems,
    sorting,
    onLoadFilms,
    onUpdateFilms,
  };

  return isTV ? <HomeScreenComponentTV { ...containerProps } /> : <HomeScreenComponent { ...containerProps } />;
}

export default HomeScreenContainer;
