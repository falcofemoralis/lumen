import { useConfigContext } from 'Context/ConfigContext';

import PlayerDurationEndComponent from './PlayerDurationEnd.component';
import PlayerDurationEndComponentTV from './PlayerDurationEnd.component.atv';

export const PlayerDurationEndContainer = () => {
  const { isTV } = useConfigContext();

  return isTV ? <PlayerDurationEndComponentTV /> : <PlayerDurationEndComponent />;
};

export default PlayerDurationEndContainer;
