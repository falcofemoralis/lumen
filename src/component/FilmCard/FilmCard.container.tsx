import { withTV } from 'Hooks/withTV';
import { memo } from 'react';

import FilmCardComponent from './FilmCard.component';
import FilmCardComponentTV from './FilmCard.component.atv';
import { FilmCardContainerProps } from './FilmCard.type';

export function FilmCardContainer(props: FilmCardContainerProps) {
  return withTV(FilmCardComponentTV, FilmCardComponent, props);
}

function propsAreEqual(prevProps: FilmCardContainerProps, props: FilmCardContainerProps) {
  return prevProps.filmCard.id === props.filmCard.id && prevProps.isFocused === props.isFocused;
}

export default memo(FilmCardContainer, propsAreEqual);
