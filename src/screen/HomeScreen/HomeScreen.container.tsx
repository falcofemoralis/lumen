import { FilmPagerQueryData, useFilmPager } from 'Component/FilmPager/useFilmPager';
import { useQueryClient } from '@tanstack/react-query';
import { createHomeCatalogLoader, MULTI_SOURCE_HOME_TABS } from '../../source/search/HomeCatalog';
import { useConfigContext, useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { cardCacheRevision, subscribeCardCache } from '../../source/search/CardCacheSync';
import { useSyncExternalStore, useMemo } from 'react';
import { usePreferredFilmCards, getHomeCardCache } from 'Hooks/usePreferredFilmCards';
import { getHomeMenu, arrangeHomeMenu, matchesHomeTab } from '../../config/HomeMenu';
import { isSourceEnabled, sourceForLink } from '../../source/types/SourceSelection';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { queryKeys } from 'Util/Query';
import { ContentSource, sourceRouter, registerUnifiedFilm, unifiedSearchService } from '../../source';

import HomeScreenComponent from './HomeScreen.component';
import HomeScreenComponentTV from './HomeScreen.component.atv';

export function HomeScreenContainer() {
  const cacheRevision = useSyncExternalStore(subscribeCardCache, cardCacheRevision);
  const { currentService } = useServiceContext();
  const { homeTabOrder, hiddenHomeTabs, tabPosition, homeDisplayMode, enabledSources } = useConfigContext();
  const isTV = useIsTV();
  const sortingOptions = useMemo(() => currentService.getFilmSortingOptions(), [currentService]);
  const menuItems = useMemo(() => arrangeHomeMenu(
    getHomeMenu(currentService.getHomeMenu()).filter(item => MULTI_SOURCE_HOME_TABS.has(item.id) || isSourceEnabled(sourceForLink(item.path))), homeTabOrder, hiddenHomeTabs,
  ), [currentService, homeTabOrder, hiddenHomeTabs, enabledSources]);
  const initialIndex = 0;
  const queryClient = useQueryClient();
  const loadCatalog = useMemo(() => createHomeCatalogLoader(), [currentService]);

  const handlers = useFilmPager({
    queryKey: [...queryKeys.films.home(), enabledSources.join(','), cacheRevision],
    menuItems,
    sorting: sortingOptions,
    initialIndex,
    prefetchAdjacent: false,
    initialDataUpdatedAt: 0,
    getInitialFilms: menuItem => getHomeCardCache().catalog(menuItem.id + ':'),
    fetchFilms: async (menuItem: MenuItemInterface, page: number, sort?: string, isRefresh?: boolean) => {
      const result = await fetchCatalog(menuItem, page, sort, isRefresh);
      if (page === 1) getHomeCardCache().rememberCatalog(menuItem.id + ':' + (sort ?? ''), result);
      return result;
    },
  });

  async function fetchCatalog(menuItem: MenuItemInterface, page: number, sort?: string, isRefresh?: boolean) {
      if (MULTI_SOURCE_HOME_TABS.has(menuItem.id)) {
        const itemKey = [...queryKeys.films.home(), enabledSources.join(','), cacheRevision, menuItem.id, sort ?? null];
        return unifiedSearchService.search('home:' + menuItem.id + ':' + (sort ?? ''), page, updates => {
          if (!updates.length) return;
          queryClient.setQueryData<FilmPagerQueryData>(itemKey, previous => previous ? {
            ...previous,
            films: previous.films.map(card => updates.find(update => update.previousLink === card.link)?.card ?? card),
          } : previous);
        }, {
          loadSource: (adapter, sourcePage) => loadCatalog(menuItem.id + (sort ? ':' + sort : ''), adapter, sourcePage,
            () => currentService.getHomeMenuFilms({ ...menuItem, variables: { ...menuItem.variables } }, sourcePage, sort, { isRefresh })),
          prepareCard: async card => card,
        }, page === 1 ? partial => {
          queryClient.setQueryData<FilmPagerQueryData>(itemKey, {
            films: partial.films, currentPage: 1, totalPages: 1,
          });
        } : undefined);
      }
      if (!isSourceEnabled(sourceForLink(menuItem.path))) return { films: [], totalPages: 1 };
      const adapter = sourceRouter.getAdapterForLink(menuItem.path);
      if (adapter?.getFilms) {
        const result = await adapter.getFilms!(menuItem.path, page, { deferMetadata: true });
        result.films.forEach((card) => registerUnifiedFilm(adapter.normalizeFilmCard(card)));
        return result;
      }
      return currentService.getHomeMenuFilms(menuItem, page, sort, { isRefresh });
  }

  const preferredPagerItems = usePreferredFilmCards(handlers.pagerItems, false, true);
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
