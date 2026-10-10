import RezkaApi from 'Api/RezkaApi';

import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmInterface } from 'Type/Film.interface';

import { ContentSource } from '../types/ContentSource';
import {
  UnifiedExternalId,
  UnifiedExternalIdType,
  UnifiedFilm,
  createUnifiedFilmId,
} from '../types/UnifiedFilm';
import { SourceAdapter } from '../types/SourceAdapter';

const getYear = (film: FilmInterface): number | undefined => {
  if (!film.releaseDate) {
    return undefined;
  }

  const match = film.releaseDate.match(/\b(19|20)\d{2}\b/);

  return match ? Number(match[0]) : undefined;
};

const RezkaSourceAdapter: SourceAdapter = {
  source: ContentSource.REZKA,
  name: 'HDRezka',

  async getFilm(link: string, options?: { background?: boolean }): Promise<FilmInterface | null> {
    return RezkaApi.getFilm(link, options);
  },

  async getFilmRatings(filmId: string) {
    return RezkaApi.getFilmRatings(filmId);
  },

  async search(
    query: string,
    page: number,
    options?: { background?: boolean },
  ): Promise<FilmListInterface> {
    return RezkaApi.search(query, page, options);
  },

  normalizeFilmCard(film: FilmCardInterface): UnifiedFilm {
    const yearMatch = `${film.subtitle} ${film.info ?? ''}`.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? Number(yearMatch[0]) : undefined;

    const externalIds: UnifiedExternalId[] = [];
    for (const [key, type] of [['imdb', UnifiedExternalIdType.IMDB], ['tmdb', UnifiedExternalIdType.TMDB], ['kinopoisk', UnifiedExternalIdType.KINOPOISK]] as const) {
      const value = film.externalIds?.[key];
      if (value) externalIds.push({ type, value });
    }
    return {
      id: createUnifiedFilmId(
        externalIds,
        film.originalTitle,
        film.title,
        year,
        film.type,
        `REZKA:${film.id}`,
      ),
      title: film.title,
      originalTitle: film.originalTitle,
      year,
      type: film.type,
      poster: film.poster,
      ratings: film.ratings,
      info: film.info,
      sources: [
        {
          source: ContentSource.REZKA,
          externalIds,
          link: film.link,
          nativeId: film.id,
        },
      ],
    };
  },

  normalizeFilm(film: FilmInterface): UnifiedFilm {
    const externalIds = this.getExternalIds(film);

    return {
      id: createUnifiedFilmId(
        externalIds,
        film.originalTitle,
        film.title,
        getYear(film),
        film.type,
        `REZKA:${film.id}`,
      ),
      title: film.title,
      originalTitle: film.originalTitle,
      year: getYear(film),
      type: film.type,
      poster: film.poster,
      largePoster: film.largePoster,
      description: film.description,
      releaseDate: film.releaseDate,
      sources: [
        {
          source: ContentSource.REZKA,
          externalIds,
          link: film.link,
          nativeId: film.id,
        },
      ],
    };
  },

  getExternalIds(film: FilmInterface): UnifiedExternalId[] {
    const externalIds: UnifiedExternalId[] = [];

    if (film.externalIds?.imdb) {
      externalIds.push({
        type: UnifiedExternalIdType.IMDB,
        value: film.externalIds.imdb,
      });
    }

    if (film.externalIds?.tmdb) {
      externalIds.push({
        type: UnifiedExternalIdType.TMDB,
        value: film.externalIds.tmdb,
      });
    }

    if (film.externalIds?.kinopoisk) {
      externalIds.push({
        type: UnifiedExternalIdType.KINOPOISK,
        value: film.externalIds.kinopoisk,
      });
    }

    return externalIds;
  },
};

export default RezkaSourceAdapter;
