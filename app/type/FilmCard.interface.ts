import { FilmType } from './FilmType.type';

export default interface FilmCardInterface {
  id: string;
  link: string;
  type: FilmType;
  poster: string;
  title: string;
  subtitle: string;
  info?: string;
}
