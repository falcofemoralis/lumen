import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { useConfigContext, useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo } from 'react';
import { usePreferredFilmCards } from 'Hooks/usePreferredFilmCards';
import { queryKeys } from 'Util/Query';
import { sourceRouter, unifiedSearchService } from '../../source';
import { ContentSource } from '../../source/types/ContentSource';
import { useQueryClient } from '@tanstack/react-query';
import { FilmPagerQueryData } from 'Component/FilmPager/useFilmPager';

import CategoryScreenComponent from './CategoryScreen.component';
import CategoryScreenComponentTV from './CategoryScreen.component.atv';
import { CategoryScreenContainerProps } from './CategoryScreen.type';

export function CategoryScreenContainer({ route }: CategoryScreenContainerProps) {
  const { link } = route.params as { link: string };
  const isTV = useIsTV();
  const { tabPosition, zonaShowAdult } = useConfigContext();
  const { currentService } = useServiceContext();
  const sourceAdapter = sourceRouter.getAdapterForLink(link);
  const queryClient = useQueryClient();
  const queryKey = [...queryKeys.films.category(link), zonaShowAdult];
  const menuItems = useMemo(() => sourceAdapter?.getFilms
    ? [{ id: 'zona-category', title: sourceAdapter.name, path: link, isHidden: true }]
    : currentService.getCategoryMenu(link), [currentService, link, sourceAdapter]);

  const { pagerItems, isError, onPreLoad, onNextLoad } = useFilmPager({
    queryKey,
    menuItems,
    fetchFilms: (menuItem, page) => sourceAdapter?.source === ContentSource.ZONA && sourceAdapter.getFilms
      ? unifiedSearchService.search('category:' + link + ':adult:' + zonaShowAdult, page, updates => {
        queryClient.setQueryData<FilmPagerQueryData>([...queryKey, menuItem.id, null], previous => previous ? {
          ...previous, films: previous.films.map(card => updates.find(update => update.previousLink === card.link)?.card ?? card),
        } : previous);
      }, {
        sources: [ContentSource.ZONA],
        loadSource: (adapter, sourcePage) => adapter.getFilms!(menuItem.path, sourcePage, { deferMetadata: true }),
        prepareCard: async card => card,
      })
      : sourceAdapter?.getFilms
      ? sourceAdapter.getFilms(menuItem.path, page, { deferMetadata: true })
      : currentService.getFilms(page, menuItem.path, { ...menuItem.variables }),
  });

  const preferredItems = usePreferredFilmCards(sourceAdapter ? pagerItems : []);
  const containerProps = {
    pagerItems: sourceAdapter ? preferredItems : pagerItems,
    isLoadError: isError,
    retryLoad: () => { if (pagerItems[0]) void onNextLoad(true, pagerItems[0]); },
    onPreLoad,
    onNextLoad,
    tabPosition,
  };

  return isTV ? <CategoryScreenComponentTV { ...containerProps } /> : <CategoryScreenComponent { ...containerProps } />;
}

export default CategoryScreenContainer;
