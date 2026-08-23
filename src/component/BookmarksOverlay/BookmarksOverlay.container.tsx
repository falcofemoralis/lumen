import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalBookmarks } from 'Hooks/useLocalLibrary';
import { t } from 'i18n/translate';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { BookmarkInterface } from 'Type/Bookmark.interface';
import { FilmInterface } from 'Type/Film.interface';
import { filmToFilmCard } from 'Util/Film';
import { createLocalCategory, toggleLocalBookmark } from 'Util/LocalLibrary';
import { queryKeys } from 'Util/Query';

import BookmarksOverlayComponent from './BookmarksOverlay.component';
import BookmarksOverlayComponentTV from './BookmarksOverlay.component.atv';
import { BookmarksOverlayContainerProps } from './BookmarksOverlay.type';

// The service bakes the category size into the label it serves ("Watch later (12)") and
// the toggle endpoint answers with no new count, so a pending change is applied to the
// label text. Left alone when there is no tally to move.
const CATEGORY_SIZE = /\((\d+)\)\s*$/;

const applySizeDelta = (title: string, delta: number): string => {
  const size = title.match(CATEGORY_SIZE)?.[1];

  if (!size || !delta) {
    return title;
  }

  return title.replace(CATEGORY_SIZE, `(${Math.max(0, Number(size) + delta)})`);
};

type BookmarkOverride = {
  isChecked: boolean;
  title: string;
};

export const BookmarksOverlayContainer = ({
  overlayRef,
  film,
  onClose,
  onBookmarkChange,
}: BookmarksOverlayContainerProps) => {
  const { currentService } = useServiceContext();
  const { isTV, isLocalLibrary } = useConfigContext();
  const localBookmarks = useLocalBookmarks();
  const queryClient = useQueryClient();

  // the overlay stays mounted between opens and the parent may keep handing back the same
  // film object, so the toggles made here are remembered locally instead of mutating the
  // prop - the label included, since it carries the category size the toggle just changed
  const [overrides, setOverrides] = useState<Record<string, BookmarkOverride>>({});
  const [syncedFilmId, setSyncedFilmId] = useState(film.id);

  if (syncedFilmId !== film.id) {
    setSyncedFilmId(film.id);
    setOverrides({});
  }

  // the film screen renders its own cached copy of the film and the player is handed a
  // snapshot of it, so the toggle is written back into the cache - otherwise coming back
  // from the player shows the film as not bookmarked and invites a second toggle
  const syncCachedFilm = (bookmarks: BookmarkInterface[]) => {
    queryClient.setQueriesData<FilmInterface | null>(
      // film details live under ['film', link]; trailer/comments keys share the prefix
      { predicate: ({ queryKey }) => queryKey[0] === 'film' && queryKey.length === 2 },
      (prevFilm) => {
        if (!prevFilm || prevFilm.id !== film.id) {
          return prevFilm;
        }

        return { ...prevFilm, bookmarks };
      }
    );
  };

  const { mutate: toggleBookmark, isPending: isLoading } = useMutation({
    mutationFn: ({ bookmarkId, isChecked }: { bookmarkId: string, isChecked: boolean }) => {
      const { id } = film;

      return isChecked
        ? currentService.addBookmark(id, bookmarkId)
        : currentService.removeBookmark(id, bookmarkId);
    },
    onSuccess: (_result, { bookmarkId, isChecked }) => {
      const { bookmarks } = film;
      const bookmark = bookmarks?.find((b) => b.id === bookmarkId);

      if (bookmarks && bookmark) {
        // moved off what is on screen rather than off the served label, so toggling the
        // same category twice lands back on the size it started at
        const title = applySizeDelta(overrides[bookmarkId]?.title ?? bookmark.title, isChecked ? 1 : -1);
        const newBookmarks = bookmarks.map(
          (b) => (b.id === bookmarkId ? { ...b, title, isBookmarked: isChecked } : b)
        );

        setOverrides((prev) => ({ ...prev, [bookmarkId]: { isChecked, title } }));
        syncCachedFilm(newBookmarks);
        onBookmarkChange?.({ ...film, bookmarks: newBookmarks });
      }

      // the bookmarks tab lists the same categories, so it has to re-read them
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() });
      queryClient.invalidateQueries({ queryKey: queryKeys.films.bookmarks() });
    },
  });

  const postBookmark = (bookmarkId: string, isChecked: boolean) => {
    if (isLocalLibrary) {
      // reactive local-bookmarks consumers (film screen, bookmarks tab) pick this up
      toggleLocalBookmark(filmToFilmCard(film), bookmarkId, isChecked);

      return;
    }

    toggleBookmark({ bookmarkId, isChecked });
  };

  const createCategory = (title: string): boolean => {
    const error = createLocalCategory(title);

    if (error === 'exists') {
      NotificationStore.displayMessage(t('Category already exists'));
    }

    return !error;
  };

  const prepareItems = () => {
    if (isLocalLibrary) {
      return localBookmarks.categories.map((category) => ({
        label: `${category.title} (${category.filmIds.length})`,
        value: category.id,
        isChecked: category.filmIds.includes(film.id),
      }));
    }

    const { bookmarks = [] } = film;

    return bookmarks.map((bookmark) => {
      const override = overrides[bookmark.id];

      return {
        label: override?.title ?? bookmark.title,
        value: bookmark.id,
        isChecked: override?.isChecked ?? bookmark.isBookmarked ?? false,
      };
    });
  };

  const containerProps = {
    postBookmark,
    overlayRef,
    film,
    isLoading,
    items: prepareItems(),
    isLocalLibrary,
    createCategory,
    onClose,
  };

  // eslint-disable-next-line max-len
  return isTV ? <BookmarksOverlayComponentTV { ...containerProps } /> : <BookmarksOverlayComponent { ...containerProps } />;
};

export default BookmarksOverlayContainer;
