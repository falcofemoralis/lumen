import { useConfigContext } from 'Context/ConfigContext';

import PlayerVideoRatingComponent from './PlayerVideoRating.component';
import PlayerVideoRatingComponentTV from './PlayerVideoRating.component.atv';
import { PlayerVideoRatingContainerProps } from './PlayerVideoRating.type';

export function PlayerVideoRatingContainer(props: PlayerVideoRatingContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <PlayerVideoRatingComponentTV { ...props } /> : <PlayerVideoRatingComponent { ...props } />;
}

export default PlayerVideoRatingContainer;
