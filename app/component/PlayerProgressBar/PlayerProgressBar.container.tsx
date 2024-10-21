import AppStore from 'Store/App.store';
import PlayerProgressBarComponent from './PlayerProgressBar.component';
import PlayerProgressBarComponentTV from './PlayerProgressBar.component.atv';
import { PlayerProgressBarContainerProps } from './PlayerProgressBar.type';

export function PlayerProgressBarContainer(props: PlayerProgressBarContainerProps) {
  return AppStore.isTV ? (
    <PlayerProgressBarComponentTV {...props} />
  ) : (
    <PlayerProgressBarComponent {...props} />
  );
}

export default PlayerProgressBarContainer;
