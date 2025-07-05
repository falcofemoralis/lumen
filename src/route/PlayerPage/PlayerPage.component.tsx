import Page from 'Component/Page';
import Player from 'Component/Player';
import { useNavigationContext } from 'Context/NavigationContext';
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
    <Page testID="player-page" disableWrapper>
      <Player
        video={ video }
        film={ film }
        voice={ voice }
        stream={ getPlayerStream(video) }
      />
    </Page>
  );
}

export default PlayerPageComponent;
