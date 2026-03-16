import { useConfigContext } from 'Context/ConfigContext';

import PlayerClockComponent from './PlayerClock.component';
import PlayerClockComponentTV from './PlayerClock.component.atv';

export const PlayerClockContainer = () => {
  const { isTV } = useConfigContext();

  return isTV ? <PlayerClockComponentTV /> : <PlayerClockComponent />;
};

export default PlayerClockContainer;
