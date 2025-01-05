import React from 'react';
import PlayerPage from 'Route/PlayerPage';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';

export default function FilmScreen() {
  const { video, film } = RouterStore.popData('player') as {
    video: FilmVideoInterface;
    film: FilmInterface;
  };

  return (
    <PlayerPage
      video={ video }
      film={ film }
    />
  );
}
