import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import OverlayStore from 'Store/Overlay.store';
import ServiceStore from 'Store/Service.store';

import BookmarksSelectorComponent from './BookmarksSelector.component';
import BookmarksSelectorComponentTV from './BookmarksSelector.component.atv';
import { BookmarksSelectorContainerProps } from './BookmarksSelector.type';

export const BookmarksSelectorContainer = ({
  overlayId,
  film,
}: BookmarksSelectorContainerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const postBookmark = async (bookmarkId: string, isChecked: boolean) => {
    const { id } = film;
    const service = ServiceStore.getCurrentService();

    try {
      setIsLoading(true);

      if (isChecked) {
        await service.addBookmark(id, bookmarkId);
      } else {
        await service.removeBookmark(id, bookmarkId);
      }

      const bk = film.bookmarks?.findIndex((b) => b.id === bookmarkId) ?? -1;
      if (bk !== -1 && film.bookmarks) {
        film.bookmarks[bk].isBookmarked = isChecked;
      }
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareData = () => {
    const { bookmarks = [] } = film;

    return bookmarks.map((bookmark) => ({
      label: bookmark.title,
      value: bookmark.id,
      isChecked: bookmark.isBookmarked ?? false,
    }));
  };

  const [data, setData] = useState(prepareData());

  useEffect(() => {
    const opened = OverlayStore.isOverlayOpened(overlayId);

    if (opened) {
      setData(prepareData());
    }
  }, [OverlayStore.currentOverlay.length]);

  const containerProps = {
    overlayId,
    film,
    isLoading,
    data,
  };

  const containerFunctions = {
    postBookmark,
  };

  return withTV(BookmarksSelectorComponentTV, BookmarksSelectorComponent, {
    ...containerProps,
    ...containerFunctions,
  });
};

export default observer(BookmarksSelectorContainer);
