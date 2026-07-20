import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalBookmarks } from 'Hooks/useLocalLibrary';
import { t } from 'i18n/translate';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { filmToFilmCard } from 'Util/Film';
import { createLocalCategory, toggleLocalBookmark } from 'Util/LocalLibrary';

import BookmarksOverlayComponent from './BookmarksOverlay.component';
import BookmarksOverlayComponentTV from './BookmarksOverlay.component.atv';
import { BookmarksOverlayContainerProps } from './BookmarksOverlay.type';

export const BookmarksOverlayContainer = ({
  overlayRef,
  film,
  onClose,
  onBookmarkChange,
}: BookmarksOverlayContainerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentService } = useServiceContext();
  const { isTV, isLocalLibrary } = useConfigContext();
  const localBookmarks = useLocalBookmarks();

  const postBookmark = async (bookmarkId: string, isChecked: boolean) => {
    const { id } = film;

    if (isLocalLibrary) {
      // reactive local-bookmarks consumers (film screen, bookmarks tab) pick this up
      toggleLocalBookmark(filmToFilmCard(film), bookmarkId, isChecked);

      return;
    }

    try {
      setIsLoading(true);

      if (isChecked) {
        await currentService.addBookmark(id, bookmarkId);
      } else {
        await currentService.removeBookmark(id, bookmarkId);
      }

      const bk = film.bookmarks?.findIndex((b) => b.id === bookmarkId) ?? -1;
      if (bk !== -1 && film.bookmarks) {
        film.bookmarks[bk].isBookmarked = isChecked;
        onBookmarkChange?.(film);
      }
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
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

    return bookmarks.map((bookmark) => ({
      label: bookmark.title,
      value: bookmark.id,
      isChecked: bookmark.isBookmarked ?? false,
    }));
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
