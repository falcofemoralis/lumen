import Player from 'Component/Player';
import { DEMO_VIDEO } from './PlayerPage.config';
import { useEffect } from 'react';
import NavigationStore from 'Store/Navigation.store';
import { PlayerPageProps } from './PlayerPage.type';
import { BackHandler } from 'react-native';
import ConfigStore from 'Store/Config.store';
import Page from 'Component/Page';

export function PlayerPageComponent(props: PlayerPageProps) {
  const { video } = props;

  useEffect(() => {
    if (ConfigStore.isTV && NavigationStore.isNavigationVisible) {
      NavigationStore.hideNavigation();
    }
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (ConfigStore.isTV) {
        NavigationStore.showNavigation();
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });

  return (
    <Page testId="playerPage">
      <Player uri={video.streams[0].url ?? DEMO_VIDEO} />
    </Page>
  );
}

export default PlayerPageComponent;
