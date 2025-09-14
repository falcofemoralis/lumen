import { useNavigation } from '@react-navigation/native';
import { services } from 'Api/services';
import {
  NOTIFICATIONS_STORAGE_CACHE,
  NOTIFICATIONS_STORAGE_CACHE_TTL,
} from 'Context/NotificationsContext';
import { defaultService, useServiceContext } from 'Context/ServiceContext';
import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import t from 'i18n/t';
import { useCallback } from 'react';
import { FILM_ROUTE } from 'Route/FilmPage/FilmPage.config';
import ConfigStore from 'Store/Config.store';
import LoggerStore from 'Store/Logger.store';
import StorageStore from 'Store/Storage.store';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { safeJsonParse } from 'Util/Json';

const BACKGROUND_TASK_IDENTIFIER = 'notifications-task';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  try {
    LoggerStore.debug('notificationsServiceTask started');

    const currentService = services[defaultService];
    const data = await currentService.getNotifications();

    const newItems = data.reduce((acc: NotificationItemInterface[], item) => {
      acc.push(...item.items);

      return acc;
    }, []);

    const cachedData = StorageStore.getMiscStorage().getString(NOTIFICATIONS_STORAGE_CACHE);

    const { data: previousData = [] } = safeJsonParse<
      { data: NotificationInterface[]; ttl: number }
    >(cachedData) ?? {};

    const previousItems = previousData.reduce((acc: NotificationItemInterface[], item) => {
      acc.push(...item.items);

      return acc;
    }, []);

    const shouldNotifyItems = newItems.reduce((acc, item) => {
      if (!previousItems.find((prevItem) => prevItem.link === item.link)) {
        acc.push(item);
      }

      return acc;
    }, [] as NotificationItemInterface[]);

    StorageStore.getMiscStorage().set(NOTIFICATIONS_STORAGE_CACHE, JSON.stringify({
      data,
      ttl: Date.now() + NOTIFICATIONS_STORAGE_CACHE_TTL,
    }));

    const shouldNotifyItemsUnique = Array.from(
      new Map(shouldNotifyItems.reverse().map(item => [item.link, item])).values()
    );

    LoggerStore.debug('notificationsServiceTask', { newItems, previousItems, shouldNotifyItemsUnique });

    if (shouldNotifyItemsUnique.length) {
      shouldNotifyItemsUnique.forEach((item) => {
        Notifications.scheduleNotificationAsync({
          content: {
            title: t('%s is available', item.name),
            body: t('%s watch now', item.info),
            data: { link: item.link },
          },
          trigger: null,
        });
      });
    }
  } catch (error) {
    LoggerStore.error('Failed to execute the background task:', { error });

    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  return BackgroundTask.BackgroundTaskResult.Success;
});

export default function useNotifications() {
  const navigation = useNavigation();
  const { isSignedIn } = useServiceContext();

  const navigateToFilm = useCallback((notification: Notifications.Notification) => {
    const { data: { link } = {} } = notification.request.content;

    navigation.navigate(FILM_ROUTE, {
      link: link as string,
    } as never);
  }, [navigation]);

  const registerNotifications = useCallback(() => {
    BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, { minimumInterval: 15 });

    LoggerStore.debug('registerNotifications', { tasks: TaskManager.getRegisteredTasksAsync() });
  }, []);

  const unregisterNotifications = useCallback(() => {
    BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER);

    LoggerStore.debug('unregisterNotifications', { tasks: TaskManager.getRegisteredTasksAsync() });
  }, []);

  const startNotificationsTask = useCallback(() => {
    if (!ConfigStore.isConfigured()
      || ConfigStore.isTV()
      || !isSignedIn
      || !ConfigStore.getConfig().notificationsEnabled
    ) {
      return () => {};
    }

    registerNotifications();

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      navigateToFilm(lastResponse.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response) {
        navigateToFilm(response.notification);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isSignedIn, navigateToFilm, registerNotifications]);

  return {
    startNotificationsTask,
    registerNotifications,
    unregisterNotifications,
  };
}