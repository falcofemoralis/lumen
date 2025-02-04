import { FilmStreamInterface } from './FilmStream.interface';

export interface FilmVideoInterface {
  streams: FilmStreamInterface[];
  subtitles?: SubtitleInterface[];
  storyboardUrl?: string;
}

export interface SubtitleInterface {
  name: string;
  languageCode: string;
  url: string;
  isDefault: boolean;
}
