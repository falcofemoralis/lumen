import Page from 'Component/Page';
import Player from 'Component/Player';
import { useEffect } from 'react';
import ConfigStore from 'Store/Config.store';
import NavigationStore from 'Store/Navigation.store';
import { getPlayerStream } from 'Util/Player';

import { PlayerPageComponentProps } from './PlayerPage.type';

export function PlayerPageComponent({ video, film, voice }: PlayerPageComponentProps) {
  useEffect(() => {
    if (ConfigStore.isTV()) {
      NavigationStore.lockNavigation();
    }

    return () => {
      if (ConfigStore.isTV()) {
        NavigationStore.unlockNavigation();
      }
    };
  }, []);

  // const testVideo = {
  //   ...video,
  //   streams: [
  //     {
  //       url: DEMO_VIDEO,
  //       quality: '360p',
  //     },
  //   ],
  // } as FilmVideoInterface;

  return (
    <Page testID="player-page">
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
