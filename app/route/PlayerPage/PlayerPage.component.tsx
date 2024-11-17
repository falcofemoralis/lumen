import Player from 'Component/Player';
import { DEMO_VIDEO } from './PlayerPage.config';
import { useEffect } from 'react';
import NavigationStore from 'Store/Navigation.store';

export function PlayerPageComponent() {
  useEffect(() => {
    NavigationStore.toggleNavigation();
  }, []);

  return <Player uri={DEMO_VIDEO} />;
}

export default PlayerPageComponent;
