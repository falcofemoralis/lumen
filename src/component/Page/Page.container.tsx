import { useRouter } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import ConfigStore from 'Store/Config.store';
import OverlayStore from 'Store/Overlay.store';

import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { PageContainerProps } from './Page.type';

export function PageContainer(props: PageContainerProps) {
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      if (ConfigStore.isTV && OverlayStore.hasOpenedOverlay()) {
        return false;
      }

      if (router.canDismiss()) {
        router.dismiss();

        return true;
      }

      if (router.canGoBack()) {
        router.back();

        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });

  return withTV(PageComponentTV, PageComponent, props);
}

export default PageContainer;
