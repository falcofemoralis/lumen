import PlayerStore from 'Component/Player/Player.store';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';

import PlayerProgressBarComponent from './PlayerProgressBar.component';
import PlayerProgressBarComponentTV from './PlayerProgressBar.component.atv';
import { PlayerProgressBarContainerProps } from './PlayerProgressBar.type';

export const PlayerProgressBarContainer = (props: PlayerProgressBarContainerProps) => {
  const containerProps = {
    progressStatus: PlayerStore.progressStatus,
    ...props,
  };

  return withTV(PlayerProgressBarComponentTV, PlayerProgressBarComponent, containerProps);
};

export default observer(PlayerProgressBarContainer);
