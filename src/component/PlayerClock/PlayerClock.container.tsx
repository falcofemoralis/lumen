import { withTV } from 'Hooks/withTV';

import PlayerClockComponent from './PlayerClock.component';
import PlayerClockComponentTV from './PlayerClock.component.atv';

// eslint-disable-next-line max-len
export const PlayerClockContainer = () => withTV(PlayerClockComponentTV, PlayerClockComponent);

export default PlayerClockContainer;
