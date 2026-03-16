import { PagerItemInterface } from './FilmPager.type';

export const pagerItemsUpdater = (key: string, item: PagerItemInterface) => {
  return (prevPagerItems: PagerItemInterface[]) =>
    prevPagerItems.map(pagerItem =>
      pagerItem.menuItem.id === key
        ? { ...pagerItem, ...item }
        : pagerItem);
};

export const pagerItemsReset = (key: string) => {
  return (prevPagerItems: PagerItemInterface[]) =>
    prevPagerItems.map(pagerItem =>
      pagerItem.menuItem.id === key
        ? { ...pagerItem, films: null, pagination: { currentPage: 1, totalPages: 1 } }
        : pagerItem);
};