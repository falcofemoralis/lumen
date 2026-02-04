import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { BookmarkInterface } from 'Type/Bookmark.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import BookmarksScreenComponent from './BookmarksScreen.component';
import BookmarksScreenComponentTV from './BookmarksScreen.component.atv';

export function BookmarksScreenContainer() {
  const { isTV } = useConfigContext();
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<BookmarkInterface[]>([]);
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});
  const { isSignedIn, currentService } = useServiceContext();

  const loadBookmarks = async () => {
    setIsLoading(true);

    try {
      const items = await currentService.getBookmarks();

      if (items.length > 0 && items[0].filmList) {
        const { id, filmList } = items[0];

        onUpdateFilms(id, filmList);
      }

      setBookmarks(items);
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
    _isRefresh: boolean
  ) => currentService.getBookmarkedFilms({
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

  const containerProps = {
    isLoading,
    bookmarks,
    filmPager,
    menuItems: getMenuItems(),
    onLoadFilms,
    onUpdateFilms,
  };

  // eslint-disable-next-line max-len
  return isTV ? <BookmarksScreenComponentTV { ...containerProps } /> : <BookmarksScreenComponent { ...containerProps } />;
}

export default BookmarksScreenContainer;
