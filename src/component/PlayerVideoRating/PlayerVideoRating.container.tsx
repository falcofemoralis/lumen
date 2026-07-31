import { useIsTV } from 'Context/ConfigContext';

import PlayerVideoRatingComponent from './PlayerVideoRating.component';
import PlayerVideoRatingComponentTV from './PlayerVideoRating.component.atv';
import { PlayerVideoRatingContainerProps } from './PlayerVideoRating.type';

export function PlayerVideoRatingContainer(props: PlayerVideoRatingContainerProps) {
  const isTV = useIsTV();

  return isTV ? <PlayerVideoRatingComponentTV { ...props } /> : <PlayerVideoRatingComponent { ...props } />;
}

export default PlayerVideoRatingContainer;
