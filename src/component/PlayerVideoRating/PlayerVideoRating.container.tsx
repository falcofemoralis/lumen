import { withTV } from 'Hooks/withTV';

import PlayerVideoRatingComponent from './PlayerVideoRating.component';
import PlayerVideoRatingComponentTV from './PlayerVideoRating.component.atv';
import { PlayerVideoRatingContainerProps } from './PlayerVideoRating.type';

export function PlayerVideoRatingContainer(props: PlayerVideoRatingContainerProps) {
  return withTV(PlayerVideoRatingComponentTV, PlayerVideoRatingComponent, props);
}

export default PlayerVideoRatingContainer;
