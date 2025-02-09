import { withTV } from 'Hooks/withTV';
import { memo } from 'react';

import FilmCardComponent from './FilmCard.component';
import FilmCardComponentTV from './FilmCard.component.atv';
import { FilmCardContainerProps } from './FilmCard.type';

export function FilmCardContainer(props: FilmCardContainerProps) {
  return withTV(FilmCardComponentTV, FilmCardComponent, props);
}

function propsAreEqual(prevProps: FilmCardContainerProps, props: FilmCardContainerProps) {
  return JSON.stringify(prevProps.filmCard) === JSON.stringify(props.filmCard)
    && prevProps.isFocused === props.isFocused && prevProps.isThumbnail === props.isThumbnail;
}

export default memo(FilmCardContainer, propsAreEqual);
