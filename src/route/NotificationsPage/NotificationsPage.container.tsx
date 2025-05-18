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
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);
  const { isSignedIn, getCurrentService, resetNotifications } = useServiceContext();

  const loadFilms = async (items: NotificationInterface[]) => {
    try {
      setIsLoading(true);

      setNotifications(
        await getCurrentService().getFilmsFromNotifications(items),
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
  }, [isSignedIn, resetNotifications]);

  useEffect(() => {
    if (isSignedIn && notifications) {
      loadFilms(notifications);
    }
  }, [isSignedIn, notifications]);

  const handleSelectFilm = useCallback((film: FilmCardInterface) => {
    openFilm(film.link);
  }, []);

  const getData = () => {
    const rawData = notifications.map((notification) => ({
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
