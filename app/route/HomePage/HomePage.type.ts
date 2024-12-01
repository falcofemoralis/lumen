import FilmCard from 'Type/FilmCard.interface';

export interface HomePageProps {
  films: FilmCard[];
  onScrollEnd: () => void;
}
