import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import { useLayoutEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import { setTimeoutSafe } from 'Util/Misc';

import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { BACK_HANDLER_DELAY } from './Page.config';
import { PageContainerProps } from './Page.type';

export function PageContainer(props: PageContainerProps) {
  const backPressedOnceRef = useRef(false);

  useLayoutEffect(() => {
    const backAction = () => {
      try {
        if (router.canDismiss() || router.canGoBack()) {
          router.dismiss();

          return true;
        }
      } catch (e) {
        NotificationStore.displayError(e as Error);

        return true;
      }

      if (ConfigStore.isTV()) {
        if (backPressedOnceRef.current) {
          BackHandler.exitApp();

          return true;
        }

        backPressedOnceRef.current = true;
        NotificationStore.displayMessage(t('Press back again to exit'));

        setTimeoutSafe(() => {
          backPressedOnceRef.current = false;
        }, BACK_HANDLER_DELAY);

        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
    };
  }, []);

  return withTV(PageComponentTV, PageComponent, props);
}

export default PageContainer;
