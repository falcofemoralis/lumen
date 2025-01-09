import { FilmListInterface } from './FilmList.interface';

export interface BookmarkInterface {
  id: string;
  title: string;
  filmList?: FilmListInterface;
}
