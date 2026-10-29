import { enqueueBookmarkRequest } from '../../source/search/BookmarkRequests';
import { scanBookmarkFolders } from '../../source/search/BookmarkFolderScan';
import { BOOKMARK_METADATA_TTL } from '../../source/search/BookmarkMetadataCache';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { FilmPagerQueryData, useFilmPager } from 'Component/FilmPager/useFilmPager';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalBookmarks } from 'Hooks/useLocalLibrary';
import { usePreferredFilmCards } from 'Hooks/usePreferredFilmCards';
import { useCallback, useMemo, useRef } from 'react';
import { LocalBookmarksBlob } from 'Type/LocalLibrary.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { getLocalFilmsForCategory } from 'Util/LocalLibrary';
import { queryKeys } from 'Util/Query';

import BookmarksScreenComponent from './BookmarksScreen.component';
import BookmarksScreenComponentTV from './BookmarksScreen.component.atv';

const buildLocalPagerItems = (
  blob: LocalBookmarksBlob,
  showBookmarkCounts: boolean
): PagerItemInterface[] => (
  blob.categories.map((category) => ({
    menuItem: {
      id: category.id,
      title: category.title,
      path: '',
    },
    displayTitle: showBookmarkCounts
      ? `${category.title} (${category.filmIds.length})`
      : undefined,
    films: getLocalFilmsForCategory(blob, category.id),
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }))
);

export function BookmarksScreenContainer() {
  const {
    isTV,
    isLocalLibrary,
    tabPosition,
    bookmarksDisplayMode,
    showBookmarkCounts,
  } = useConfigContext();
  const { isSignedIn, currentService } = useServiceContext();
  const localBookmarks = useLocalBookmarks();
  const manageCategoriesOverlayRef = useRef<ThemedOverlayRef | null>(null);
  const { isInternetAvailable } = useNetworkContext();

  const isRemote = isSignedIn && !isLocalLibrary;

  const {
    data: bookmarks,
    isLoading: isBookmarksLoading,
  } = useQuery({
    queryKey: queryKeys.bookmarks(),
    queryFn: () => currentService.getBookmarks(),
    enabled: isRemote && isInternetAvailable,
  });

  const queryClient = useQueryClient();
  // The provider initially embeds only the first folder. Visit all folders/pages in the background.
  useQuery({
    queryKey: ['bookmark-folder-scan', bookmarks?.map(item => item.id + ':' + item.title).join('|')],
    enabled: isRemote && isInternetAvailable && !!bookmarks?.length,
    staleTime: BOOKMARK_METADATA_TTL,
    retry: false,
    queryFn: async () => {
      const key = (id: string) => [...queryKeys.films.bookmarks(), id, null];
      await scanBookmarkFolders(bookmarks ?? [],
        id => {
          const state = queryClient.getQueryState(key(id));
          return state && Date.now() - state.dataUpdatedAt < BOOKMARK_METADATA_TTL
            ? queryClient.getQueryData<FilmPagerQueryData>(key(id)) : undefined;
        },
        (id, data) => { queryClient.setQueryData(key(id), data); },
        (bookmark, page) => enqueueBookmarkRequest('bookmark-pages:' + bookmark.id + ':' + page,
          () => currentService.getBookmarkedFilms(bookmark, page)));
      return true;
    },
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

  // The service title contains the category size, for example "Films (1200)".
  // Keep menuItem.title untouched because it is also used by the API layer.
  const displayPagerItems = useMemo(
    () => pagerItems.map((item) => {
      const bookmark = bookmarks?.find(({ id }) => id === item.menuItem.id);
      const title = bookmark?.title ?? item.menuItem.title;
      const titleWithoutCount = title.replace(/\s*\(\d+\)\s*$/, '');

      return {
        ...item,
        displayTitle: showBookmarkCounts ? title : titleWithoutCount,
      };
    }),
    [pagerItems, bookmarks, showBookmarkCounts]
  );

  // local items are purely derived, so FilmPager's paging round-trips can never
  // write duplicates back into them
  const localPagerItems = useMemo(
    () => (
      isLocalLibrary
        ? buildLocalPagerItems(localBookmarks, showBookmarkCounts)
        : []
    ),
    [localBookmarks, isLocalLibrary, showBookmarkCounts]
  );

  const openManageCategories = () => {
    manageCategoriesOverlayRef.current?.open();
  };

  const preferredPagerItems = usePreferredFilmCards(isLocalLibrary ? localPagerItems : displayPagerItems, true);
  const containerProps = {
    isLoading: isLocalLibrary ? false : !isSignedIn || isBookmarksLoading,
    pagerItems: preferredPagerItems,
    isLocalLibrary,
    tabPosition,
    displayMode: bookmarksDisplayMode,
    manageCategoriesOverlayRef,
    onPreLoad,
    onNextLoad,
    openManageCategories,
  };

  // eslint-disable-next-line max-len
  return isTV ? <BookmarksScreenComponentTV { ...containerProps } /> : <BookmarksScreenComponent { ...containerProps } />;
}

export default BookmarksScreenContainer;
