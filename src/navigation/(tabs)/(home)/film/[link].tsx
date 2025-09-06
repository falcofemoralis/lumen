import { useGlobalSearchParams } from 'expo-router';
import React from 'react';
import FilmPage from 'Route/FilmPage';

export default function FilmScreen() {
  const { link, poster } = useGlobalSearchParams();

  return <FilmPage link={ link as string } thumbnailPoster={ poster as string } />;
}
