import { useIsTV } from 'Context/ConfigContext';

import PlayerProgressBarComponent from './PlayerProgressBar.component';
import PlayerProgressBarComponentTV from './PlayerProgressBar.component.atv';
import { PlayerProgressBarContainerProps } from './PlayerProgressBar.type';

export const PlayerProgressBarContainer = (props: PlayerProgressBarContainerProps) => {
  const isTV = useIsTV();

  return isTV ? <PlayerProgressBarComponentTV { ...props } /> : <PlayerProgressBarComponent { ...props } />;
};

export default PlayerProgressBarContainer;