import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import PlayerPage from 'Route/PlayerPage';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';

export default function FilmScreen() {
  const { data } = useLocalSearchParams();
  const { video, film } = JSON.parse(data as string) as {
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
