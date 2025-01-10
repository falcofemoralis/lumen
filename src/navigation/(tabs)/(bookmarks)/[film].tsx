import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import FilmPage from 'Route/FilmPage';

export default function FilmScreen() {
  const { film } = useLocalSearchParams();

  return <FilmPage link={ film as string } />;
}
