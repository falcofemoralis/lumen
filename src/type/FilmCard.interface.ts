import { FilmType } from './FilmType.type';

export interface FilmCardInterface {
  id: string;
  link: string;
  type: FilmType;
  poster: string;
  title: string;
  subtitle: string;
  info?: string;
  isPendingRelease?: boolean;
}
