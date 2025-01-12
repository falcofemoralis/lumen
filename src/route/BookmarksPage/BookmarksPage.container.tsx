import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { BookmarkInterface } from 'Type/Bookmark.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import BookmarksPageComponent from './BookmarksPage.component';
import BookmarksPageComponentTV from './BookmarksPage.component.atv';

export function BookmarksPageContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(ServiceStore.isSignedIn);
  const [bookmarks, setBookmarks] = useState<BookmarkInterface[]>([]);
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});

  const loadBookmarks = async () => {
    setIsLoading(true);

    console.log('loadBookmarks');

    try {
      const items = await ServiceStore.getCurrentService().getBookmarks();

      console.log('loadedBookmarks ', items.length);

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
    if (isSignedIn !== ServiceStore.isSignedIn) {
      setIsSignedIn(ServiceStore.isSignedIn);
    }

    if (ServiceStore.isSignedIn) {
      loadBookmarks();
    }
  }, [ServiceStore.isSignedIn]);

  const onLoadFilms = async (
    menuItem: MenuItemInterface,
    currentPage: number,
    _isRefresh: boolean,
  ) => {
    console.log(menuItem);

    return ServiceStore.getCurrentService().getBookmarkedFilms({
      id: menuItem.id,
      title: menuItem.title,
    }, currentPage);
  };

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
    isSignedIn,
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

export default observer(BookmarksPageContainer);
