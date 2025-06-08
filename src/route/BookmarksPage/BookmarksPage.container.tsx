import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { BookmarkInterface } from 'Type/Bookmark.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import BookmarksPageComponent from './BookmarksPage.component';
import BookmarksPageComponentTV from './BookmarksPage.component.atv';

export function BookmarksPageContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<BookmarkInterface[]>([]);
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});
  const { isSignedIn, getCurrentService } = useServiceContext();

  const loadBookmarks = async () => {
    setIsLoading(true);

    try {
      const items = await getCurrentService().getBookmarks();

      if (items.length > 0 && items[0].filmList) {
        const { id, filmList } = items[0];

        onUpdateFilms(id, filmList);
      }

      setBookmarks(items);
    } catch (e) {
      NotificationStore.displayError(e as Error);
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
    _isRefresh: boolean
  ) => getCurrentService().getBookmarkedFilms({
    id: menuItem.id,
    title: menuItem.title,
  }, currentPage);

  const onUpdateFilms = async (key: string, filmList: FilmListInterface) => {
    setFilmPager((prevFilmPager) => ({
      ...prevFilmPager,
      [key]: {
        filmList,
      },
    }));
  };

  const getMenuItems = (): MenuItemInterface[] => bookmarks.map((item) => ({
    id: item.id,
    title: item.title,
    path: '',
  }));

  const containerFunctions = {
    onLoadFilms,
    onUpdateFilms,
  };

  const containerProps = () => ({
    isLoading,
    bookmarks,
    filmPager,
    menuItems: getMenuItems(),
  });

  return withTV(BookmarksPageComponentTV, BookmarksPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default BookmarksPageContainer;
