import AppStore from 'Store/App.store';
import FilmCardComponent from './FilmCard.component';
import FilmCardComponentTV from './FilmCard.component.atv';
import { FilmCardContainerProps } from './FilmCard.type';

export function FilmCardContainer(props: FilmCardContainerProps) {
  return AppStore.isTV ? <FilmCardComponentTV {...props} /> : <FilmCardComponent {...props} />;
}

export default FilmCardContainer;
