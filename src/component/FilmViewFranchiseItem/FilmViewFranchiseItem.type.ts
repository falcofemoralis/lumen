import { FilmInterface } from 'Type/Film.interface';
import { FranchiseItem } from 'Type/FranchiseItem.interface';

export interface FilmViewFranchiseItemContainerProps {
  film: FilmInterface;
  item: FranchiseItem;
  idx: number;
  handleSelectFilm: (film: FilmInterface) => void;
}

export type FilmViewFranchiseItemComponentProps = FilmViewFranchiseItemContainerProps;
