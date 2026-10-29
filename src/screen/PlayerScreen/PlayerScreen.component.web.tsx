import { useEffect, useState } from 'react';
import { navigate } from 'Util/Navigation';
import { Page } from 'Component/Page';
import { Player } from 'Component/Player';
import { PLAYER_SCREEN, TABS_SCREEN } from 'Navigation/navigationRoutes';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { PlayerScreenComponentProps } from './PlayerScreen.type';

export const PlayerScreen = () => {
  const [session] = useState(() => RouterStore.popData(PLAYER_SCREEN));
  useEffect(() => { if (!session) navigate(TABS_SCREEN); }, [session]);
  if (!session) return null;
  const { video, film, voice, isOffline, quality } = session as {
    video: FilmVideoInterface;
    film: FilmInterface;
    voice: FilmVoiceInterface;
    isOffline: boolean;
    quality?: string;
  };

  return (
    <PlayerScreenComponent
      video={ video }
      film={ film }
      voice={ voice }
      isOffline={ isOffline }
      quality={ quality }
    />
  );
};

export function PlayerScreenComponent({ video, film, voice, isOffline, quality }: PlayerScreenComponentProps) {
  return (
    <Page
      fullscreen
      checkConnection={ false }
    >
      <Player
        video={ video }
        film={ film }
        voice={ voice }
        isOffline={ isOffline }
        quality={ quality }
      />
    </Page>
  );
}

export default PlayerScreen;

