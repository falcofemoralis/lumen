import { ACCOUNT_ROUTE, NOTIFICATIONS_ROUTE } from 'Component/NavigationBar/NavigationBar.config';
import { BadgeData } from 'Component/NavigationBar/NavigationBar.type';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { safeJsonParse } from 'Util/Json';
import { miscStorage } from 'Util/Storage';

import { useServiceContext } from './ServiceContext';

export const NOTIFICATIONS_STORAGE = 'NOTIFICATIONS_STORAGE';
export const NOTIFICATIONS_STORAGE_CACHE = 'NOTIFICATIONS_STORAGE_CACHE';

interface NotificationsContextInterface {
  badgeData: BadgeData;
  getNotifications: () => Promise<NotificationInterface[] | null>;
  resetNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextInterface>({
  badgeData: {},
  getNotifications: async () => null,
  resetNotifications: async () => {},
});

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { getCurrentService } = useServiceContext();
  const [badgeData, setBadgeData] = useState<BadgeData>({});

  const updateBadge = useCallback((data: NotificationInterface[]) => {
    const newItems = data.reduce((acc: NotificationItemInterface[], item) => {
      acc.push(...item.items);

      return acc;
    }, []);

    const previousItems = safeJsonParse<NotificationItemInterface[]>(
      miscStorage.getString(NOTIFICATIONS_STORAGE)
    ) ?? [];

    const badgeCount = newItems.reduce((acc, item) => {
      if (!previousItems.find((prevItem) => prevItem.link === item.link)) {
        acc += 1;
      }

      return acc;
    }, 0);

    setBadgeData({
      [ConfigStore.isTV() ? NOTIFICATIONS_ROUTE : ACCOUNT_ROUTE]: badgeCount,
    });
  }, []);

  /**
   * Load notifications for the current service
   */
  const getNotifications = useCallback(async () => {
    try {
      const cachedData = miscStorage.getString(NOTIFICATIONS_STORAGE_CACHE);

      if (cachedData) {
        const { data, ttl } = JSON.parse(cachedData) as { data: NotificationInterface[]; ttl: number };

        if (Date.now() < ttl) {
          updateBadge(data);

          return data;
        }
      }

      const data = await getCurrentService().getNotifications();

      miscStorage.set(NOTIFICATIONS_STORAGE_CACHE, JSON.stringify({
        data,
        ttl: Date.now() + 1000 * 60 * 60, // 1 hour
      }));

      updateBadge(data);

      return data;
    } catch (error) {
      NotificationStore.displayError(error as Error);

      return null;
    }
  }, [updateBadge]);

  /**
   * Reset notifications for the current service
   */
  const resetNotifications = useCallback(async () => {
    const cachedData = miscStorage.getString(NOTIFICATIONS_STORAGE_CACHE);
    const { data: notifications } = safeJsonParse<{ data: NotificationInterface[] }>(cachedData) || { data: null };

    if (notifications) {
      const newItems = notifications.reduce((acc: NotificationItemInterface[], item) => {
        acc.push(...item.items);

        return acc;
      }, []);

      miscStorage.set(NOTIFICATIONS_STORAGE, JSON.stringify(newItems));
    }

    setBadgeData({
      [ConfigStore.isTV() ? NOTIFICATIONS_ROUTE : ACCOUNT_ROUTE]: 0,
    });
  }, []);

  const value = useMemo(() => ({
    badgeData,
    getNotifications,
    resetNotifications,
  }), [
    badgeData,
    getNotifications,
    resetNotifications,
  ]);

  return (
    <NotificationsContext.Provider value={ value }>
      { children }
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => use(NotificationsContext);
