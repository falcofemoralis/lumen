import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import PlayerPage from 'Route/PlayerPage';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';

export default function FilmScreen() {
  const { data } = useLocalSearchParams();
  const video = JSON.parse(data as string) as FilmVideoInterface;

  return <PlayerPage video={video} />;
}
