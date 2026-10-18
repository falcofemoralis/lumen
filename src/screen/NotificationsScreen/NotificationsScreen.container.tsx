import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useMemo } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { queryKeys, STALE_TIME } from 'Util/Query';

import NotificationsScreenComponent from './NotificationsScreen.component';
import NotificationsScreenComponentTV from './NotificationsScreen.component.atv';
import { resolveNotificationCards } from './NotificationsScreen.resolve';

export function NotificationsScreenContainer() {
  const queryClient = useQueryClient();
  const { isTV, isLocalLibrary } = useConfigContext();
  const { isSignedIn, currentService, resetNotifications, getNotifications } = useServiceContext();

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: async () => {
      const notifications = await getNotifications();

      if (!notifications.length) {
        return [];
      }

      const films = await resolveNotificationCards(
        notifications,
        queryClient.getQueryData(queryKeys.notifications()) ?? [],
        (items) => currentService.getFilmsFromNotifications(items),
        (items) => queryClient.setQueryData(queryKeys.notifications(), items)
      );
      resetNotifications();

      return films;
    },
    enabled: isSignedIn || isLocalLibrary,
    // resolving every notification into a film card is expensive, so keep the
    // result while the user navigates in and out of the screen
    staleTime: STALE_TIME.MEDIUM,
  });

  const groupedData = useMemo(() => data.map((notification) => ({
    header: notification.date,
    films: notification.items
      .filter((item) => item.film)
      .map((item) => item.film as FilmCardInterface),
  })).filter((item) => item.films.length), [data]);

  const containerProps = {
    isLoading,
    data: groupedData,
  };

  // eslint-disable-next-line max-len
  return isTV ? <NotificationsScreenComponentTV { ...containerProps } /> : <NotificationsScreenComponent { ...containerProps } />;
}

export default NotificationsScreenContainer;
