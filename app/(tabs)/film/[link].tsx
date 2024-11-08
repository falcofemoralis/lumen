import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import FilmPage from 'Route/FilmPage';

export default function HomeScreen() {
  const { link } = useLocalSearchParams();

  return <FilmPage link={link as string} />;
}
