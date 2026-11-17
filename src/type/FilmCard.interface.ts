import { FilmType } from './FilmType.type';
import { FilmRatingsInterface } from './FilmRatings.interface';
import { ContentSource } from '../source/types/ContentSource';
import type { UnifiedFilmSource } from '../source/types/UnifiedFilm';

export interface FilmCardInterface {
  id: string;
  link: string;
  type: FilmType;
  poster: string;
  title: string;
  subtitle: string;
  info?: string;
  isEpisodic?: boolean;
  contentTypePending?: boolean;
  originalTitle?: string;
  externalIds?: { imdb?: string; tmdb?: string; kinopoisk?: string };
  sources?: UnifiedFilmSource[];
  ratings?: FilmRatingsInterface;
  ratingSourceType?: ContentSource;
  ratingFilmId?: string;
  isPendingRelease?: boolean;
}


