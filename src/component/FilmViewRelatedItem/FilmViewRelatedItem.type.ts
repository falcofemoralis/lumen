import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmViewRelatedItemContainerProps {
  item: FilmCardInterface;
  handleSelectFilm: (film: FilmInterface) => void;
}

export type FilmViewRelatedItemComponentProps = FilmViewRelatedItemContainerProps;
