import { useRouter, useNavigation } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { HistoryItem, PageProps } from './Page.type';
import { CommonActions } from '@react-navigation/native';

export function PageContainer(props: PageProps) {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        const state = navigation.getState();
        const history = state?.history ?? [];
        const lastHistoryItem = history[history.length - 1] as HistoryItem;
        const beforeHistoryItem = history[history.length - 2] as HistoryItem;
        const routes = Array.from(state?.routes ?? []);
        const newRoutes = routes.filter((r) => r.key !== lastHistoryItem.key);
        const lastRouteIdx = routes.findIndex((r) => r.key === beforeHistoryItem.key);

        navigation.dispatch(
          CommonActions.reset({
            index: lastRouteIdx, // to which route go to (index from routes)
            routes: newRoutes as any, // available routes
          })
        );

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
