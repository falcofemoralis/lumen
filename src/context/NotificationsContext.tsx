import { NavigationRoute, ParamListBase } from '@react-navigation/native';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { ACCOUNT_ROUTE } from 'Route/AccountPage/AccountPage.config';
import { NOTIFICATIONS_ROUTE } from 'Route/NotificationsPage/NotificationsPage.config';
import ConfigStore from 'Store/Config.store';
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import StorageStore from 'Store/Storage.store';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { safeJsonParse } from 'Util/Json';

import { useServiceContext } from './ServiceContext';

export const NOTIFICATIONS_STORAGE = 'NOTIFICATIONS_STORAGE';
export const NOTIFICATIONS_STORAGE_CACHE = 'NOTIFICATIONS_STORAGE_CACHE';
export const NOTIFICATIONS_STORAGE_CACHE_TTL = 1000 * 60 * 60; // 1 hour

export type BadgeData = {
  [key in NavigationRoute<ParamListBase, string>['name']]?: number;
}

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
  const { currentService } = useServiceContext();
  const [badgeData, setBadgeData] = useState<BadgeData>({});

  const updateBadge = useCallback((data: NotificationInterface[]) => {
    const newItems = data.reduce((acc: NotificationItemInterface[], item) => {
      acc.push(...item.items);

      return acc;
    }, []);

    const previousItems = safeJsonParse<NotificationItemInterface[]>(
      StorageStore.getMiscStorage().getString(NOTIFICATIONS_STORAGE)
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
      const cachedData = StorageStore.getMiscStorage().getString(NOTIFICATIONS_STORAGE_CACHE);

      LoggerStore.debug('getNotifications', { cachedData });

      if (cachedData) {
        const { data, ttl } = JSON.parse(cachedData) as { data: NotificationInterface[]; ttl: number };

        if (Date.now() < ttl) {
          updateBadge(data);

          return data;
        }
      }

      const data = await currentService.getNotifications();

      StorageStore.getMiscStorage().set(NOTIFICATIONS_STORAGE_CACHE, JSON.stringify({
        data,
        ttl: Date.now() + NOTIFICATIONS_STORAGE_CACHE_TTL,
      }));

      updateBadge(data);

      return data;
    } catch (error) {
      LoggerStore.error('getNotifications', { error });

      NotificationStore.displayError(error as Error);

      return null;
    }
  }, [updateBadge, currentService]);

  /**
   * Reset notifications for the current service
   */
  const resetNotifications = useCallback(async () => {
    const cachedData = StorageStore.getMiscStorage().getString(NOTIFICATIONS_STORAGE_CACHE);
    const { data: notifications } = safeJsonParse<{ data: NotificationInterface[] }>(cachedData) || { data: null };

    if (notifications) {
      const newItems = notifications.reduce((acc: NotificationItemInterface[], item) => {
        acc.push(...item.items);

        return acc;
      }, []);

      StorageStore.getMiscStorage().set(NOTIFICATIONS_STORAGE, JSON.stringify(newItems));
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
