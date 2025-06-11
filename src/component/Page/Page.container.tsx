import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useLayoutEffect } from 'react';
import { BackHandler } from 'react-native';
import NotificationStore from 'Store/Notification.store';

import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { PageContainerProps } from './Page.type';

export function PageContainer(props: PageContainerProps) {
  useLayoutEffect(() => {
    const backAction = () => {
      try {
        if (router.canDismiss()) {
          router.dismiss();

          return true;
        }
      } catch (e) {
        NotificationStore.displayError(e as Error);

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
