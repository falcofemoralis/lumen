import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import CategoryPage from 'Route/CategoryPage';

export default function FilmScreen() {
  const { link } = useLocalSearchParams();

  return <CategoryPage link={ link as string } />;
}
