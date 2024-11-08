import { withTV } from 'Hooks/withTV';
import FilmCardComponent from './FilmCard.component';
import FilmCardComponentTV from './FilmCard.component.atv';
import { FilmCardContainerProps } from './FilmCard.type';

export function FilmCardContainer(props: FilmCardContainerProps) {
  return withTV(FilmCardComponentTV, FilmCardComponent, props);
}

export default FilmCardContainer;
