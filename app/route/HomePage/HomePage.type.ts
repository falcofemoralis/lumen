import FilmCardInterface from 'Type/FilmCard.interface';

export interface HomePageProps {
  films: FilmCardInterface[];
  onScrollEnd: () => void;
}
