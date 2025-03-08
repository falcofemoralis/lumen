import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { NotificationInterface } from 'Type/Notification.interface';
import { openFilm } from 'Util/Router';

import NotificationsPageComponent from './NotificationsPage.component';
import NotificationsPageComponentTV from './NotificationsPage.component.atv';

export function NotificationsPageContainer() {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);

  const loadFilms = async (items: NotificationInterface[]) => {
    try {
      setIsLoading(true);

      setNotifications(
        await ServiceStore.getCurrentService().getFilmsFromNotifications(items),
      );
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ServiceStore.isSignedIn) {
      ServiceStore.resetNotifications();
    }
  }, []);

  useEffect(() => {
    if (ServiceStore.isSignedIn && ServiceStore.notifications) {
      loadFilms(ServiceStore.notifications);
    }
  }, [ServiceStore.isSignedIn, ServiceStore.notifications]);

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

export default observer(NotificationsPageContainer);
