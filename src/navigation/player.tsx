import React from 'react';
import PlayerPage from 'Route/PlayerPage';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

export default function PlayerScreen() {
  const { video, film, voice } = RouterStore.popData('player') as {
    video: FilmVideoInterface;
    film: FilmInterface;
    voice: FilmVoiceInterface;
  };

  return (
    <PlayerPage
      video={ video }
      film={ film }
      voice={ voice }
    />
  );
}
