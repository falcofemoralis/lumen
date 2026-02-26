import { Page } from 'Component/Page';
import { Player } from 'Component/Player';
import { useConfigContext } from 'Context/ConfigContext';
import { useNavigationContext } from 'Context/NavigationContext';
import { PLAYER_SCREEN } from 'Navigation/navigationRoutes';
import { useEffect } from 'react';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { PlayerScreenComponentProps } from './PlayerScreen.type';

export const PlayerScreen = () => {
  const { video, film, voice, isOffline } = RouterStore.popData(PLAYER_SCREEN) as {
    video: FilmVideoInterface;
    film: FilmInterface;
    voice: FilmVoiceInterface;
    isOffline: boolean;
  };

  return (
    <PlayerScreenComponent
      video={ video }
      film={ film }
      voice={ voice }
      isOffline={ isOffline }
    />
  );
};

export function PlayerScreenComponent({ video, film, voice, isOffline }: PlayerScreenComponentProps) {
  const { isTV } = useConfigContext();
  const { lockNavigation, unlockNavigation } = useNavigationContext();

  useEffect(() => {
    if (isTV) {
      lockNavigation();
    }

    return () => {
      if (isTV) {
        unlockNavigation();
      }
    };
  }, []);

  return (
    <Page fullscreen>
      <Player
        video={ video }
        film={ film }
        voice={ voice }
        isOffline={ isOffline }
      />
    </Page>
  );
}

export default PlayerScreen;
