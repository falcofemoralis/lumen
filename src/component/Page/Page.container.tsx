import { useRouter } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { PageContainerProps } from './Page.type';

export function PageContainer(props: PageContainerProps) {
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      if (router.canDismiss()) {
        router.dismiss();

        return true;
      }

      // This code prevents user from closing the app on lvl1 screen (recent, search, etc...)
      // if (router.canGoBack()) {
      //   router.back();

      //   return true;
      // }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });

  return withTV(PageComponentTV, PageComponent, props);
}

export default PageContainer;
