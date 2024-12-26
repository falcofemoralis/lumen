import Page from 'Component/Page';
import Player from 'Component/Player';
import { useEffect } from 'react';
import NavigationStore from 'Store/Navigation.store';

import { DEMO_VIDEO } from './PlayerPage.config';
import { PlayerPageComponentProps } from './PlayerPage.type';

export function PlayerPageComponent({ video }: PlayerPageComponentProps) {
  useEffect(() => {
    NavigationStore.lockNavigation();

    return () => {
      NavigationStore.unlockNavigation();
    };
  }, []);

  return (
    <Page>
      <Player uri={ DEMO_VIDEO ?? video.streams[0]?.url } />
    </Page>
  );
}

export default PlayerPageComponent;
