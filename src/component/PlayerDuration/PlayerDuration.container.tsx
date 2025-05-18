import { usePlayerContext } from 'Context/PlayerContext';
import { withTV } from 'Hooks/withTV';

import PlayerDurationComponent from './PlayerDuration.component';
import PlayerDurationComponentTV from './PlayerDuration.component.atv';

export const PlayerDurationContainer = () => {
  const { progressStatus } = usePlayerContext();

  const containerProps = {
    progressStatus,
  };

  return withTV(PlayerDurationComponentTV, PlayerDurationComponent, containerProps);
};

export default PlayerDurationContainer;
