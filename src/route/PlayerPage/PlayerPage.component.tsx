import Page from 'Component/Page';
import Player from 'Component/Player';
import { useNavigationContext } from 'Context/NavigationContext';
import { useEffect } from 'react';
import ConfigStore from 'Store/Config.store';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { PLAYER_ROUTE } from './PlayerPage.config';
import { PlayerPageComponentProps } from './PlayerPage.type';

export const PlayerPage = () => {
  const { video, film, voice } = RouterStore.popData(PLAYER_ROUTE) as {
    video: FilmVideoInterface;
    film: FilmInterface;
    voice: FilmVoiceInterface;
  };

  return (
    <PlayerPageComponent
      video={ video }
      film={ film }
      voice={ voice }
    />
  );
};

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
      />
    </Page>
  );
}

export default PlayerPage;
