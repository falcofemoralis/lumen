import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo } from 'react';
import { queryKeys } from 'Util/Query';

import CategoryScreenComponent from './CategoryScreen.component';
import CategoryScreenComponentTV from './CategoryScreen.component.atv';
import { CategoryScreenContainerProps } from './CategoryScreen.type';

export function CategoryScreenContainer({ route }: CategoryScreenContainerProps) {
  const { link } = route.params as { link: string };
  const isTV = useIsTV();
  const { currentService } = useServiceContext();
  const menuItems = useMemo(() => currentService.getCategoryMenu(link), [currentService, link]);

  const { pagerItems, onPreLoad, onNextLoad } = useFilmPager({
    queryKey: queryKeys.films.category(link),
    menuItems,
    fetchFilms: (menuItem, page) => currentService.getFilms(page, menuItem.path, { ...menuItem.variables }),
  });

  const containerProps = {
    pagerItems,
    onPreLoad,
    onNextLoad,
  };

  return isTV ? <CategoryScreenComponentTV { ...containerProps } /> : <CategoryScreenComponent { ...containerProps } />;
}

export default CategoryScreenContainer;
