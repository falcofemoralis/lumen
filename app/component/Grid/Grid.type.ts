import FilmCard from 'Type/FilmCard.interface';

export interface GridContainerProps {
  films: FilmCard[];
}

export interface GridComponentProps {
  rows: FilmCard[][];
  handleOnPress: (film: FilmCard) => void;
}
