import { PagerItemInterface } from './FilmPager.type';

export const pagerItemsUpdater = (key: string, item: PagerItemInterface) => {
  return (prevPagerItems: PagerItemInterface[]) =>
    prevPagerItems.map(pagerItem =>
      pagerItem.menuItem.id === key
        ? { ...pagerItem, ...item }
        : pagerItem);
};