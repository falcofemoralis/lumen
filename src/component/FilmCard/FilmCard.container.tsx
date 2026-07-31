import { useIsTV } from 'Context/ConfigContext';
import { memo } from 'react';

import FilmCardComponent from './FilmCard.component';
import FilmCardComponentTV from './FilmCard.component.atv';
import { FilmCardContainerProps } from './FilmCard.type';

export function FilmCardContainer(props: FilmCardContainerProps) {
  const isTV = useIsTV();

  return isTV ? <FilmCardComponentTV { ...props } /> : <FilmCardComponent { ...props } />;
}

export default memo(FilmCardContainer);
