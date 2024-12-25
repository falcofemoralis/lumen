import Page from 'Component/Page';
import Player from 'Component/Player';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import ConfigStore from 'Store/Config.store';
import NavigationStore from 'Store/Navigation.store';

import { DEMO_VIDEO } from './PlayerPage.config';
import { PlayerPageComponentProps } from './PlayerPage.type';

export function PlayerPageComponent({ video }: PlayerPageComponentProps) {
  useEffect(() => {
    if (ConfigStore.isTV && !NavigationStore.isNavigationLocked) {
      NavigationStore.lockNavigation();
    }

    return () => {
      if (ConfigStore.isTV) {
        NavigationStore.unlockNavigation();
      }
    };
  }, []);

  return (
    <Page>
      <Player uri={ DEMO_VIDEO ?? video.streams[0]?.url } />
    </Page>
  );
}

export default PlayerPageComponent;
