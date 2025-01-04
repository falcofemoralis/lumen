import Page from 'Component/Page';
import Player from 'Component/Player';
import { useEffect } from 'react';
import NavigationStore from 'Store/Navigation.store';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';

import { DEMO_VIDEO } from './PlayerPage.config';
import { PlayerPageComponentProps } from './PlayerPage.type';

export function PlayerPageComponent({ video, film }: PlayerPageComponentProps) {
  useEffect(() => {
    NavigationStore.lockNavigation();

    return () => {
      NavigationStore.unlockNavigation();
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
    <Page>
      <Player
        video={ video }
        film={ film }
      />
    </Page>
  );
}

export default PlayerPageComponent;
