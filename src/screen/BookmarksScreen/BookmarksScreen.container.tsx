import { useQuery } from '@tanstack/react-query';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { useFilmPager } from 'Component/FilmPager/useFilmPager';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalBookmarks } from 'Hooks/useLocalLibrary';
import { useCallback, useMemo, useRef } from 'react';
import { LocalBookmarksBlob } from 'Type/LocalLibrary.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { getLocalFilmsForCategory } from 'Util/LocalLibrary';
import { queryKeys } from 'Util/Query';

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
  const { isSignedIn, currentService } = useServiceContext();
  const localBookmarks = useLocalBookmarks();
  const manageCategoriesOverlayRef = useRef<ThemedOverlayRef | null>(null);

  const {
    data: bookmarks,
    isLoading: isBookmarksLoading,
  } = useQuery({
    queryKey: queryKeys.bookmarks(),
    queryFn: () => currentService.getBookmarks(),
    enabled: isSignedIn && !isLocalLibrary,
  });

  const menuItems = useMemo(
    () => (bookmarks ?? []).map(({ id, title }) => ({ id, title, path: '' })),
    [bookmarks]
  );

  const getInitialFilms = useCallback(
    (menuItem: MenuItemInterface) => bookmarks?.find(({ id }) => id === menuItem.id)?.filmList,
    [bookmarks]
  );

  const { pagerItems, onPreLoad, onNextLoad } = useFilmPager({
    queryKey: queryKeys.films.bookmarks(),
    menuItems,
    fetchFilms: (menuItem, page) => currentService.getBookmarkedFilms({
      id: menuItem.id,
      title: menuItem.title,
    }, page),
    getInitialFilms,
    enabled: !isLocalLibrary,
  });

  // local items are purely derived, so FilmPager's paging round-trips can never
  // write duplicates back into them
  const localPagerItems = useMemo(
    () => (isLocalLibrary ? buildLocalPagerItems(localBookmarks) : []),
    [localBookmarks, isLocalLibrary]
  );

  const openManageCategories = () => {
    manageCategoriesOverlayRef.current?.open();
  };

  const containerProps = {
    isLoading: isLocalLibrary ? false : !isSignedIn || isBookmarksLoading,
    pagerItems: isLocalLibrary ? localPagerItems : pagerItems,
    isLocalLibrary,
    manageCategoriesOverlayRef,
    onPreLoad,
    onNextLoad,
    openManageCategories,
  };

  // eslint-disable-next-line max-len
  return isTV ? <BookmarksScreenComponentTV { ...containerProps } /> : <BookmarksScreenComponent { ...containerProps } />;
}

export default BookmarksScreenContainer;
