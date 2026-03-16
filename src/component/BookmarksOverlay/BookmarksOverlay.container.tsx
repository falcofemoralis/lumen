import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';

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
  const { isTV } = useConfigContext();

  const postBookmark = async (bookmarkId: string, isChecked: boolean) => {
    const { id } = film;

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

  const prepareItems = () => {
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
    onClose,
  };

  // eslint-disable-next-line max-len
  return isTV ? <BookmarksOverlayComponentTV { ...containerProps } /> : <BookmarksOverlayComponent { ...containerProps } />;
};

export default BookmarksOverlayContainer;
