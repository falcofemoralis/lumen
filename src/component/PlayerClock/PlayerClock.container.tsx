import { withTV } from 'Hooks/withTV';

import PlayerClockComponent from './PlayerClock.component';
import PlayerClockComponentTV from './PlayerClock.component.atv';

export const PlayerClockContainer = () => withTV(PlayerClockComponentTV, PlayerClockComponent);

export default PlayerClockContainer;
