import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useCallback, useMemo } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { queryKeys, STALE_TIME } from 'Util/Query';
import { openFilm } from 'Util/Router';

import NotificationsScreenComponent from './NotificationsScreen.component';
import NotificationsScreenComponentTV from './NotificationsScreen.component.atv';

export function NotificationsScreenContainer() {
  const { isTV, isLocalLibrary } = useConfigContext();
  const { isSignedIn, currentService, resetNotifications, getNotifications } = useServiceContext();
  const navigation = useNavigation();

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: async () => {
      const notifications = await getNotifications();

      if (!notifications.length) {
        return [];
      }

      resetNotifications();

      return currentService.getFilmsFromNotifications(notifications);
    },
    enabled: isSignedIn || isLocalLibrary,
    // resolving every notification into a film card is expensive, so keep the
    // result while the user navigates in and out of the screen
    staleTime: STALE_TIME.MEDIUM,
  });

  const handleSelectFilm = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
  }, [navigation]);

  const groupedData = useMemo(() => data.map((notification) => ({
    header: notification.date,
    films: notification.items
      .filter((item) => item.film)
      .map((item) => item.film as FilmCardInterface),
  })).filter((item) => item.films.length), [data]);

  const containerProps = {
    isLoading,
    data: groupedData,
    handleSelectFilm,
  };

  // eslint-disable-next-line max-len
  return isTV ? <NotificationsScreenComponentTV { ...containerProps } /> : <NotificationsScreenComponent { ...containerProps } />;
}

export default NotificationsScreenContainer;
