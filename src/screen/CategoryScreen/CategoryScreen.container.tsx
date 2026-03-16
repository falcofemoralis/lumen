import { pagerItemsReset, pagerItemsUpdater } from 'Component/FilmPager/FilmPager.config';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useState } from 'react';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import CategoryScreenComponent from './CategoryScreen.component';
import CategoryScreenComponentTV from './CategoryScreen.component.atv';
import { CATEGORY_MENU_ITEM } from './CategoryScreen.config';
import { CategoryScreenContainerProps } from './CategoryScreen.type';

export function CategoryScreenContainer({ route }: CategoryScreenContainerProps) {
  const { link } = route.params as { link: string };
  const { isTV } = useConfigContext();
  const [pagerItems, setPagerItems] = useState<PagerItemInterface[]>([{
    menuItem: CATEGORY_MENU_ITEM,
    films: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }]);
  const { currentService } = useServiceContext();

  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => {
    if (isRefresh) {
      setPagerItems(pagerItemsReset(menuItem.id));
    }

    return currentService.getFilms(currentPage, link);
  };

  const onUpdateFilms = (key: string, item: PagerItemInterface) => {
    setPagerItems(pagerItemsUpdater(key, item));
  };

  const containerProps = {
    pagerItems,
    onLoadFilms,
    onUpdateFilms,
  };

  return isTV ? <CategoryScreenComponentTV { ...containerProps } /> : <CategoryScreenComponent { ...containerProps } />;
}

export default CategoryScreenContainer;
