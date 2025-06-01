import { withTV } from 'Hooks/withTV';

import PlayerDurationComponent from './PlayerDuration.component';
import PlayerDurationComponentTV from './PlayerDuration.component.atv';

export const PlayerDurationContainer = () => {
  return withTV(PlayerDurationComponentTV, PlayerDurationComponent);
};

export default PlayerDurationContainer;
