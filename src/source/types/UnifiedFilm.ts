import { FilmType } from 'Type/FilmType.type';
import { FilmRatingsInterface } from 'Type/FilmRatings.interface';

import { ContentSource } from './ContentSource';

export enum UnifiedExternalIdType {
  IMDB = 'IMDB',
  TMDB = 'TMDB',
  ANILIST = 'ANILIST',
  MAL = 'MAL',
  KINOPOISK = 'KINOPOISK',
  OTHER = 'OTHER',
}

export interface UnifiedExternalId {
  type: UnifiedExternalIdType;
  value: string;
}

export interface UnifiedFilmSource {
  source: ContentSource;
  externalIds: UnifiedExternalId[];
  link: string;
  nativeId?: string;
}

const normalizeUnifiedIdentityValue = (value: string): string => (
  value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\u0451/g, '\u0435')
    .replace(/[^a-z\u0430-\u044f0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

export const createUnifiedFilmId = (
  externalIds: UnifiedExternalId[],
  originalTitle: string | undefined,
  title: string,
  year: number | undefined,
  type: FilmType,
  sourceFallbackId: string,
): string => {
  const externalIdPriority: UnifiedExternalIdType[] = [
    UnifiedExternalIdType.IMDB,
    UnifiedExternalIdType.TMDB,
    UnifiedExternalIdType.ANILIST,
    UnifiedExternalIdType.MAL,
    UnifiedExternalIdType.KINOPOISK,
    UnifiedExternalIdType.OTHER,
  ];

  for (const typePriority of externalIdPriority) {
    const externalId = externalIds.find(
      (item) => item.type === typePriority && item.value.trim(),
    );

    if (externalId) {
      return `EXTERNAL:${typePriority}:${externalId.value.trim().toLowerCase()}`;
    }
  }

  const normalizedTitle = normalizeUnifiedIdentityValue(
    originalTitle ?? title,
  );

  if (normalizedTitle && year) {
    return `CONTENT:${type}:${year}:${normalizedTitle}`;
  }

  return sourceFallbackId;
};

export interface UnifiedFilm {
  id: string;

  title: string;
  originalTitle?: string;
  year?: number;
  type: FilmType;

  poster: string;
  largePoster?: string;

  description?: string;
  releaseDate?: string;
  info?: string;
  contentTypePending?: boolean;
  isPendingRelease?: boolean;
  subtitle?: string;
  ratings?: FilmRatingsInterface;

  sources: UnifiedFilmSource[];
}

