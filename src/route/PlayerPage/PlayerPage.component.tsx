import Page from 'Component/Page';
import Player from 'Component/Player';
import { useNavigationContext } from 'Context/NavigationContext';
import { PlayerProvider } from 'Context/PlayerContext';
import { useEffect } from 'react';
import ConfigStore from 'Store/Config.store';
import { getPlayerStream } from 'Util/Player';

import { PlayerPageComponentProps } from './PlayerPage.type';

export function PlayerPageComponent({ video, film, voice }: PlayerPageComponentProps) {
  const { lockNavigation, unlockNavigation } = useNavigationContext();

  useEffect(() => {
    if (ConfigStore.isTV()) {
      lockNavigation();
    }

    return () => {
      if (ConfigStore.isTV()) {
        unlockNavigation();
      }
    };
  }, []);

  return (
    <Page disableStyles>
      <PlayerProvider>
        <Player
          video={ video }
          film={ film }
          voice={ voice }
          stream={ getPlayerStream(video) }
        />
      </PlayerProvider>
    </Page>
  );
}

export default PlayerPageComponent;
