import { pagerItemsReset, pagerItemsUpdater } from 'Component/FilmPager/FilmPager.config';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import BookmarksScreenComponent from './BookmarksScreen.component';
import BookmarksScreenComponentTV from './BookmarksScreen.component.atv';

export function BookmarksScreenContainer() {
  const { isTV } = useConfigContext();
  const [isLoading, setIsLoading] = useState(true);
  const [pagerItems, setPagerItems] = useState<PagerItemInterface[]>([]);

  const { isSignedIn, currentService } = useServiceContext();

  const loadBookmarks = async () => {
    setIsLoading(true);

    try {
      const items = await currentService.getBookmarks();

      setPagerItems(items.reduce((acc, menuItem) => {
        acc.push({
          menuItem: {
            ...menuItem,
            path: '',
          },
          films: menuItem.filmList ? menuItem.filmList.films : null,
          pagination: {
            currentPage: 1,
            totalPages: menuItem.filmList ? menuItem.filmList.totalPages : 1,
          },
        });

        return acc;
      }, [] as PagerItemInterface[]));
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      loadBookmarks();
    }
  }, [isSignedIn]);

  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => {
    if (isRefresh) {
      setPagerItems(pagerItemsReset(menuItem.id));
    }

    return currentService.getBookmarkedFilms({
      id: menuItem.id,
      title: menuItem.title,
    }, currentPage);
  };

  const onUpdateFilms = (key: string, item: PagerItemInterface) => setPagerItems(pagerItemsUpdater(key, item));

  const containerProps = {
    isLoading,
    pagerItems,
    onLoadFilms,
    onUpdateFilms,
  };

  // eslint-disable-next-line max-len
  return isTV ? <BookmarksScreenComponentTV { ...containerProps } /> : <BookmarksScreenComponent { ...containerProps } />;
}

export default BookmarksScreenContainer;
