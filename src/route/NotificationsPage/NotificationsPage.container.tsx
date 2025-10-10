import { useNavigation } from '@react-navigation/native';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useCallback, useEffect, useState } from 'react';
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { NotificationInterface } from 'Type/Notification.interface';
import { openFilm } from 'Util/Router';

import NotificationsPageComponent from './NotificationsPage.component';
import NotificationsPageComponentTV from './NotificationsPage.component.atv';

export function NotificationsPageContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<NotificationInterface[]>([]);
  const { isSignedIn, currentService, resetNotifications, getNotifications } = useServiceContext();
  const navigation = useNavigation();

  const loadFilms = async (items: NotificationInterface[]) => {
    try {
      setData(
        await currentService.getFilmsFromNotifications(items)
      );
    } catch (error) {
      LoggerStore.error('notificationsLoadFilms', { error });

      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareNotifications = async () => {
    if (isSignedIn && !data.length) {
      const notifications = await getNotifications();

      if (notifications) {
        resetNotifications();

        loadFilms(notifications);

        return;
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isSignedIn) {
      prepareNotifications();
    }
  }, [isSignedIn]);

  const handleSelectFilm = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
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
