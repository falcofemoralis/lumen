import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { useConfigContext, useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo } from 'react';
import { usePreferredFilmCards } from 'Hooks/usePreferredFilmCards';
import { queryKeys } from 'Util/Query';
import { sourceRouter } from '../../source';

import CategoryScreenComponent from './CategoryScreen.component';
import CategoryScreenComponentTV from './CategoryScreen.component.atv';
import { CategoryScreenContainerProps } from './CategoryScreen.type';

export function CategoryScreenContainer({ route }: CategoryScreenContainerProps) {
  const { link } = route.params as { link: string };
  const isTV = useIsTV();
  const { tabPosition } = useConfigContext();
  const { currentService } = useServiceContext();
  const sourceAdapter = sourceRouter.getAdapterForLink(link);
  const menuItems = useMemo(() => sourceAdapter?.getFilms
    ? [{ id: 'zona-category', title: 'Zona', path: link, isHidden: true }]
    : currentService.getCategoryMenu(link), [currentService, link, sourceAdapter]);

  const { pagerItems, isError, onPreLoad, onNextLoad } = useFilmPager({
    queryKey: queryKeys.films.category(link),
    menuItems,
    fetchFilms: (menuItem, page) => sourceAdapter?.getFilms
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
