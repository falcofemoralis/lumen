import { useConfigContext } from 'Context/ConfigContext';

import PlayerDurationComponent from './PlayerDuration.component';
import PlayerDurationComponentTV from './PlayerDuration.component.atv';

export const PlayerDurationContainer = () => {
  const { isTV } = useConfigContext();

  return isTV ? <PlayerDurationComponentTV /> : <PlayerDurationComponent />;
};

export default PlayerDurationContainer;
