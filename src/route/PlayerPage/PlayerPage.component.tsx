import Page from 'Component/Page';
import Player from 'Component/Player';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import ConfigStore from 'Store/Config.store';
import NavigationStore from 'Store/Navigation.store';

import { PlayerPageComponentProps } from './PlayerPage.type';

export function PlayerPageComponent({ video }: PlayerPageComponentProps) {
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
    <Page>
      <Player uri={ video.streams[0].url } />
    </Page>
  );
}

export default PlayerPageComponent;
