import { withTV } from 'Hooks/withTV';
import PlayerProgressBarComponent from './PlayerProgressBar.component';
import PlayerProgressBarComponentTV from './PlayerProgressBar.component.atv';
import { PlayerProgressBarContainerProps } from './PlayerProgressBar.type';

export function PlayerProgressBarContainer(props: PlayerProgressBarContainerProps) {
  return withTV(PlayerProgressBarComponentTV, PlayerProgressBarComponent, props);
}

export default PlayerProgressBarContainer;
