import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import ServiceStore from 'Store/Service.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { NotificationInterface } from 'Type/Notification.interface';
import { openFilm } from 'Util/Router';

import NotificationsPageComponent from './NotificationsPage.component';
import NotificationsPageComponentTV from './NotificationsPage.component.atv';

export function NotificationsPageContainer() {
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);

  const loadFilms = async (items: NotificationInterface[]) => {
    setNotifications(
      await ServiceStore.getCurrentService().getFilmsFromNotifications(items),
    );
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

  const containerFunctions = {
    handleSelectFilm,
  };

  const containerProps = () => ({
    notifications,
  });

  return withTV(NotificationsPageComponentTV, NotificationsPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(NotificationsPageContainer);
