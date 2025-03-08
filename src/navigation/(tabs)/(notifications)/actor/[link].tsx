import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import ActorPage from 'Route/ActorPage';

export default function ActorScreen() {
  const { link } = useLocalSearchParams();

  return <ActorPage link={ link as string } />;
}
