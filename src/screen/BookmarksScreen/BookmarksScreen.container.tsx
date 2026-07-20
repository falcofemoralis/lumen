import { pagerItemsReset, pagerItemsUpdater } from 'Component/FilmPager/FilmPager.config';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalBookmarks } from 'Hooks/useLocalLibrary';
import { useEffect, useMemo, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { LocalBookmarksBlob } from 'Type/LocalLibrary.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { getLocalBookmarks, getLocalFilmsForCategory } from 'Util/LocalLibrary';

import BookmarksScreenComponent from './BookmarksScreen.component';
import BookmarksScreenComponentTV from './BookmarksScreen.component.atv';

const buildLocalPagerItems = (blob: LocalBookmarksBlob): PagerItemInterface[] => (
  blob.categories.map((category) => ({
    menuItem: {
      id: category.id,
      title: category.title,
      path: '',
    },
    films: getLocalFilmsForCategory(blob, category.id),
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }))
);

export function BookmarksScreenContainer() {
  const { isTV, isLocalLibrary } = useConfigContext();
  const [isLoading, setIsLoading] = useState(true);
  const [pagerItems, setPagerItems] = useState<PagerItemInterface[]>([]);
  const { handleConnectionError } = useNetworkContext();
  const localBookmarks = useLocalBookmarks();
  const manageCategoriesOverlayRef = useRef<ThemedOverlayRef | null>(null);

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
      const handled = handleConnectionError(error as Error);

      if (!handled) {
        NotificationStore.displayError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // local items are purely derived, so FilmPager's paging round-trips can never
  // write duplicates back into them
  const localPagerItems = useMemo(() => buildLocalPagerItems(localBookmarks), [localBookmarks]);

  useEffect(() => {
    if (isSignedIn && !isLocalLibrary) {
      loadBookmarks();
    }
  }, [isSignedIn, isLocalLibrary]);

  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    isRefresh: boolean
  ) => {
    if (isLocalLibrary) {
      return {
        films: getLocalFilmsForCategory(getLocalBookmarks(), menuItem.id),
        totalPages: 1,
      };
    }

    if (isRefresh) {
      setPagerItems(pagerItemsReset(menuItem.id));
    }

    return currentService.getBookmarkedFilms({
      id: menuItem.id,
      title: menuItem.title,
    }, currentPage);
  };

  const onUpdateFilms = (key: string, item: PagerItemInterface) => {
    if (isLocalLibrary) {
      return;
    }

    setPagerItems(pagerItemsUpdater(key, item));
  };

  const openManageCategories = () => {
    manageCategoriesOverlayRef.current?.open();
  };

  const containerProps = {
    isLoading: isLocalLibrary ? false : isLoading,
    pagerItems: isLocalLibrary ? localPagerItems : pagerItems,
    isLocalLibrary,
    manageCategoriesOverlayRef,
    onLoadFilms,
    onUpdateFilms,
    openManageCategories,
  };

  // eslint-disable-next-line max-len
  return isTV ? <BookmarksScreenComponentTV { ...containerProps } /> : <BookmarksScreenComponent { ...containerProps } />;
}

export default BookmarksScreenContainer;
