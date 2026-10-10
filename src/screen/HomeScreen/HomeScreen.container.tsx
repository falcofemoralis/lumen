import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { useConfigContext, useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo } from 'react';
import { usePreferredFilmCards } from 'Hooks/usePreferredFilmCards';
import { getHomeMenu, arrangeHomeMenu, matchesHomeTab } from '../../config/HomeMenu';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { queryKeys } from 'Util/Query';
import { ContentSource, sourceRouter, registerUnifiedFilm } from '../../source';

import HomeScreenComponent from './HomeScreen.component';
import HomeScreenComponentTV from './HomeScreen.component.atv';

export function HomeScreenContainer() {
  const { currentService } = useServiceContext();
  const { homeTabOrder, hiddenHomeTabs, tabPosition, homeDisplayMode } = useConfigContext();
  const isTV = useIsTV();
  const sortingOptions = useMemo(() => currentService.getFilmSortingOptions(), [currentService]);
  const menuItems = useMemo(() => arrangeHomeMenu(
    getHomeMenu(currentService.getHomeMenu()), homeTabOrder, hiddenHomeTabs,
  ), [currentService, homeTabOrder, hiddenHomeTabs]);
  const initialIndex = 0;

  const handlers = useFilmPager({
    queryKey: queryKeys.films.home(),
    menuItems,
    sorting: sortingOptions,
    initialIndex,
    prefetchAdjacent: false,
    fetchFilms: async (menuItem: MenuItemInterface, page: number, sort?: string, isRefresh?: boolean) => {
      if (menuItem.id.startsWith('zona-')) {
        const adapter = sourceRouter.getAdapter(ContentSource.ZONA)!;
        const result = await adapter.getFilms!(menuItem.path, page, { deferMetadata: true });
        result.films.forEach((card) => registerUnifiedFilm(adapter.normalizeFilmCard(card)));
        return result;
      }
      return currentService.getHomeMenuFilms(menuItem, page, sort, { isRefresh });
    },
  });

  const preferredPagerItems = usePreferredFilmCards(handlers.pagerItems);
  const filteredPagerItems = useMemo(() => preferredPagerItems.map((item) => ({
    ...item,
    films: item.films?.filter((card) => matchesHomeTab(item.menuItem.id, card)) ?? null,
  })), [preferredPagerItems]);
  const containerProps = {
    ...handlers,
    pagerItems: filteredPagerItems,
    tabPosition,
    displayMode: homeDisplayMode,
  };

  return isTV ? <HomeScreenComponentTV { ...containerProps } /> : <HomeScreenComponent { ...containerProps } />;
}

export default HomeScreenContainer;
