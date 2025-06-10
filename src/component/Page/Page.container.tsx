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
      console.log(`backAction page ${props.testID}`);

      try {
        if (router.canDismiss()) {
          router.dismiss();

          return true;
        }
      } catch (e) {
        NotificationStore.displayError(e as Error);

        return true;
      }

      // This code prevents user from closing the app on lvl1 screen (recent, search, etc...)
      // if (router.canGoBack()) {
      //   router.back();

      //   return true;
      // }
      return false;
    };

    console.log(`set backHandler on page ${props.testID}`);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      console.log(`remove backHandler on page ${props.testID}`);

      backHandler.remove();
    };
  }, []);

  return withTV(PageComponentTV, PageComponent, props);
}

export default PageContainer;
