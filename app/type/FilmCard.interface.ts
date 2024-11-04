import { FilmType } from './FilmType.type';

export default interface FilmCard {
  id: string;
  link: string;
  type: FilmType;
  title: string;
  poster: string;
  year?: string;
  countries?: string[];
  genres?: string[];
  seriesInfo?: string;
}
