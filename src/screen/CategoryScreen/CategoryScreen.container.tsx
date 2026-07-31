import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo } from 'react';
import { queryKeys } from 'Util/Query';

import CategoryScreenComponent from './CategoryScreen.component';
import CategoryScreenComponentTV from './CategoryScreen.component.atv';
import { CATEGORY_MENU_ITEM } from './CategoryScreen.config';
import { CategoryScreenContainerProps } from './CategoryScreen.type';

export function CategoryScreenContainer({ route }: CategoryScreenContainerProps) {
  const { link } = route.params as { link: string };
  const isTV = useIsTV();
  const { currentService } = useServiceContext();
  const menuItems = useMemo(() => [CATEGORY_MENU_ITEM], []);

  const { pagerItems, onPreLoad, onNextLoad } = useFilmPager({
    queryKey: queryKeys.films.category(link),
    menuItems,
    fetchFilms: (_menuItem, page) => currentService.getFilms(page, link),
  });

  const containerProps = {
    pagerItems,
    onPreLoad,
    onNextLoad,
  };

  return isTV ? <CategoryScreenComponentTV { ...containerProps } /> : <CategoryScreenComponent { ...containerProps } />;
}

export default CategoryScreenContainer;
