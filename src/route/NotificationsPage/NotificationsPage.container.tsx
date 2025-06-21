import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useCallback, useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { NotificationInterface } from 'Type/Notification.interface';
import { openFilm } from 'Util/Router';

import NotificationsPageComponent from './NotificationsPage.component';
import NotificationsPageComponentTV from './NotificationsPage.component.atv';

export function NotificationsPageContainer() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<NotificationInterface[]>([]);
  const { isSignedIn, notifications, getCurrentService, resetNotifications } = useServiceContext();

  const loadFilms = async (items: NotificationInterface[]) => {
    try {
      setIsLoading(true);

      setData(
        await getCurrentService().getFilmsFromNotifications(items)
      );
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      resetNotifications();
    }
  }, []);

  useEffect(() => {
    if (isSignedIn && !data.length && notifications && !isLoading) {
      loadFilms(notifications);
    }
  }, [isSignedIn, notifications]);

  const handleSelectFilm = useCallback((film: FilmCardInterface) => {
    openFilm(film);
  }, []);

  const getData = () => {
    const rawData = data.map((notification) => ({
      header: notification.date,
      films: notification.items
        .filter((item) => item.film)
        .map((item) => item.film as FilmCardInterface),
    }));

    return rawData.filter((item) => item.films.length);
  };

  const containerFunctions = {
    handleSelectFilm,
  };

  const containerProps = () => ({
    isLoading,
    data: getData(),
  });

  return withTV(NotificationsPageComponentTV, NotificationsPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default NotificationsPageContainer;
