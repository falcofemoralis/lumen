import { FilmStreamInterface } from './FilmStream.interface';

export interface FilmVideoInterface {
  streams: FilmStreamInterface[];
  subtitles?: string[];
  thumbnails?: string[];
}
