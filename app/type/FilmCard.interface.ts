import { FilmType } from './FilmType.type';

export default interface FilmCard {
  id: string;
  link: string;
  type: FilmType;
  poster: string;
  title: string;
  info: string;
  seriesInfo?: string;
}
