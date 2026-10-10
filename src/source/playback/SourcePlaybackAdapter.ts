import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { ContentSource } from '../types/ContentSource';

export interface SourcePlaybackAdapter {
  readonly source: ContentSource;

  getFilmVoices(
    film: FilmInterface,
  ): Promise<FilmVoiceInterface[]>;

  getFilmSeasons(
    film: FilmInterface,
    voice: FilmVoiceInterface,
  ): Promise<FilmVoiceInterface>;

  getFilmStreamsByVoice(
    film: FilmInterface,
    voice: FilmVoiceInterface,
  ): Promise<FilmVideoInterface>;

  getFilmStreamsByEpisodeId(
    film: FilmInterface,
    voice: FilmVoiceInterface,
    seasonId: string,
    episodeId: string,
  ): Promise<FilmVideoInterface>;
}
