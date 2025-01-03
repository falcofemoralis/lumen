import { useNavigation, useRouter } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import ConfigStore from 'Store/Config.store';
import OverlayStore from 'Store/Overlay.store';

import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { PageContainerProps } from './Page.type';

export function PageContainer(props: PageContainerProps) {
  const router = useRouter();
  const navigation = useNavigation();

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
        // const state = navigation.getState();
        // const history = state?.history ?? [];
        // const lastHistoryItem = history[history.length - 1] as HistoryItem;
        // const beforeHistoryItem = history[history.length - 2] as HistoryItem;
        // const routes = Array.from(state?.routes ?? []);
        // const newRoutes = routes.filter((r) => r.key !== lastHistoryItem.key);
        // const lastRouteIdx = routes.findIndex((r) => r.key === beforeHistoryItem.key);

        // navigation.dispatch(
        //   CommonActions.reset({
        //     index: lastRouteIdx, // to which route go to (index from routes)
        //     // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required
        //     routes: newRoutes as any, // available routes
        //   }),
        // );

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
