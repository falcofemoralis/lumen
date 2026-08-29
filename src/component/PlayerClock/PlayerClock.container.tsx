import { useIsTV } from 'Context/ConfigContext';

import PlayerClockComponent from './PlayerClock.component';
import PlayerClockComponentTV from './PlayerClock.component.atv';

export const PlayerClockContainer = () => {
  const isTV = useIsTV();

  return isTV ? <PlayerClockComponentTV /> : <PlayerClockComponent />;
};

export default PlayerClockContainer;
