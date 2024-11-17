import Player from 'Component/Player';
import { DEMO_VIDEO } from './PlayerPage.config';

export function PlayerPageComponent() {
  return <Player uri={DEMO_VIDEO} />;
}

export default PlayerPageComponent;
