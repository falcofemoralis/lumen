import PlayerStore from 'Component/Player/Player.store';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';

import PlayerDurationComponent from './PlayerDuration.component';
import PlayerDurationComponentTV from './PlayerDuration.component.atv';

export const PlayerDurationContainer = () => {
  const containerProps = {
    progressStatus: PlayerStore.progressStatus,
  };

  return withTV(PlayerDurationComponentTV, PlayerDurationComponent, containerProps);
};

export default observer(PlayerDurationContainer);
