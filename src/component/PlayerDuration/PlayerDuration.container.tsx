import { useIsTV } from 'Context/ConfigContext';

import PlayerDurationComponent from './PlayerDuration.component';
import PlayerDurationComponentTV from './PlayerDuration.component.atv';

export const PlayerDurationContainer = () => {
  const isTV = useIsTV();

  return isTV ? <PlayerDurationComponentTV /> : <PlayerDurationComponent />;
};

export default PlayerDurationContainer;
