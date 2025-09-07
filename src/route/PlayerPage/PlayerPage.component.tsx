import Page from 'Component/Page';
import Player from 'Component/Player';
import { useNavigationContext } from 'Context/NavigationContext';
import { useEffect } from 'react';
import ConfigStore from 'Store/Config.store';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { getPlayerStream } from 'Util/Player';

import { PLAYER_ROUTE } from './PlayerPage.config';

export function PlayerPageComponent() {
  const { lockNavigation, unlockNavigation } = useNavigationContext();

  const { video, film, voice } = RouterStore.popData(PLAYER_ROUTE) as {
    video: FilmVideoInterface;
    film: FilmInterface;
    voice: FilmVoiceInterface;
  };

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
