import { useConfigContext } from 'Context/ConfigContext';

import PlayerProgressBarComponent from './PlayerProgressBar.component';
import PlayerProgressBarComponentTV from './PlayerProgressBar.component.atv';
import { PlayerProgressBarContainerProps } from './PlayerProgressBar.type';

export const PlayerProgressBarContainer = (props: PlayerProgressBarContainerProps) => {
  const { isTV } = useConfigContext();

  return isTV ? <PlayerProgressBarComponentTV { ...props } /> : <PlayerProgressBarComponent { ...props } />;
};

export default PlayerProgressBarContainer;