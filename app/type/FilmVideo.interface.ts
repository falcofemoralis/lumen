import { FilmStream } from './FilmStream.interface';

export interface FilmVideo {
  streams: FilmStream[];
  subtitles?: string[];
  thumbnails?: string[];
}
