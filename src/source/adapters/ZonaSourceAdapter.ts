import { ActorCardInterface } from 'Type/ActorCard.interface';
import { getZonaCollections } from './ZonaCollections';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { buildFilmSubtitle, subtitleFromFilm } from 'Util/Film/subtitle';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmType } from 'Type/FilmType.type';
import {
  EpisodeInterface,
  FilmVoiceInterface,
  SeasonInterface,
} from 'Type/FilmVoice.interface';

import { ContentSource } from '../types/ContentSource';
import {
  UnifiedExternalId,
  UnifiedExternalIdType,
  UnifiedFilm,
  createUnifiedFilmId,
} from '../types/UnifiedFilm';
import { SourceAdapter } from '../types/SourceAdapter';
import { fetchZonaText } from '../request';

const ZONA_BASE_URL = 'https://w1.zona.im';

interface ZonaSeasonData {
  slug: string;
  part: number;
  episode_count: number;
  is_banned: boolean;
}

interface ZonaEpisodeData {
  slug: string;
  title: string;
  title_original?: string | null;
  description?: string;
  cover_url?: string;
  part: number;
  duration?: number;
  release_date?: string;
  is_banned: boolean;
  meta?: {
    id: number;
    media_id?: number | null;
  };
}

interface ZonaFilmData {
  slug: string;
  title: string;
  type?: 'movie' | 'series';
  title_original?: string | null;
  title_eng?: string | null;
  description?: string;
  parts?: number;
  cover_url?: string;
  backdrop_url?: string;
  backdrop_id?: number | null;
  age_limit?: number;
  year?: number;
  rating?: number;
  rating_kp?: number | null;
  rating_imdb?: number | null;
  rating_count?: number;
  duration?: number;
  duration_ms?: number;
  directors?: string;
  writers?: string;
  kp_id?: number;
  statuses?: {
    dmca?: boolean;
    memorandum?: boolean;
  };
  upload_date?: string;
  best_quality?: string;
  release_date?: string;
  release_date_ru?: string;
  release_date_dvd?: string | null;
  release_date_bluray?: string | null;
  end_year?: number;
  series_ended?: number;
  seasons?: ZonaSeasonData[];
  episodes?: ZonaEpisodeData[];
  meta?: {
    id?: number;
    media_id?: number | null;
    embed_url?: string;
    actors?: Array<{
      name: string;
      cover_url?: string;
      role?: string;
    }>;
    tags?: Array<{
      slug: string;
      title: string;
      title_original?: string | null;
      description?: string | null;
      cover_url?: string;
      type: string;
    }>;
    studios?: unknown[];
    sequels?: ZonaFilmData[];
    relations?: ZonaFilmData[];
  };
}

interface ZonaRscEntity {
  data: ZonaFilmData;
  poster?: string;
  entityType: 'movie' | 'series';
  seasonSlug?: string;
  episodeSlug?: string;
  defaultSeasonSlug?: string;
  entityTitle?: string;
}

const getFilmTypeFromUrl = (link: string): FilmType => {
  if (link.includes('/tvseries/')) {
    return FilmType.SERIES;
  }

  return FilmType.FILM;
};

const getEntityTypeFromFilmType = (
  type: FilmType,
): 'movie' | 'series' => (
  type === FilmType.SERIES ? 'series' : 'movie'
);

const getYear = (data: ZonaFilmData): number | undefined => data.year;

const classifyZonaContent = (
  entityType: 'movie' | 'series',
  data: Pick<ZonaFilmData, 'meta'>,
): FilmType => {
  const genres = (data.meta?.tags ?? []).filter((tag) => tag.type === 'genre');
  if (genres.some((tag) => tag.slug === 'anime' || tag.title.toLowerCase() === 'аниме')) {
    return FilmType.ANIME;
  }
  if (genres.some((tag) => tag.slug === 'multfilm' || tag.title.toLowerCase() === 'мультфильм')) {
    return FilmType.CARTOON;
  }
  return entityType === 'series' ? FilmType.SERIES : FilmType.FILM;
};

const formatZonaDuration = (minutes?: number): string | undefined => {
  if (
    typeof minutes !== 'number'
    || !Number.isFinite(minutes)
    || minutes <= 0
  ) {
    return undefined;
  }

  const totalMinutes = Math.floor(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} мин.`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${remainingMinutes} мин.`;
};
const extractZonaRsc6Payload = (html: string): string | null => {
  for (const match of html.matchAll(/self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)/gs)) {
    const payload = JSON.parse('"' + match[1] + '"') as string;
    if (payload.includes('"data":{') && payload.includes('"entityType":') && findZonaFilmData(payload)) return payload;
  }
  return null;
};
const findZonaFilmData = (payload: string): ZonaRscEntity | null => {
  const dataMarker = '"data":{';
  const dataIndex = payload.indexOf(dataMarker);

  if (dataIndex < 0) {
    return null;
  }

  const objectStart = dataIndex + dataMarker.length - 1;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = objectStart; index < payload.length; index += 1) {
    const character = payload[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{') {
      depth += 1;
      continue;
    }

    if (character === '}') {
      depth -= 1;

      if (depth === 0) {
        const dataJson = payload.slice(objectStart, index + 1);

        try {
          const parsedData = JSON.parse(dataJson) as ZonaFilmData;
          if (!parsedData.slug || !parsedData.title) return null;
          return {
            data: parsedData,
            entityType: payload.includes('"entityType":"series"')
              ? 'series'
              : 'movie',
            seasonSlug: extractRscValue(payload, 'seasonSlug'),
            episodeSlug: extractRscValue(payload, 'episodeSlug'),
            defaultSeasonSlug: extractRscValue(
              payload,
              'defaultSeasonSlug',
            ),
          };
        } catch {
          return null;
        }
      }
    }
  }

  return null;
};

const extractRscValue = (
  payload: string,
  key: string,
): string | undefined => {
  const match = payload.match(
    new RegExp(`"${key}":"((?:\\\\.|[^"\\\\])*)"`, 'i'),
  );

  if (!match) {
    return undefined;
  }

  return JSON.parse(`"${match[1]}"`) as string;
};

const fetchZonaEntity = async (
  link: string,
): Promise<ZonaRscEntity | null> => {
  const html = await fetchZonaText(link);
  const payload = extractZonaRsc6Payload(html);

  if (!payload) {
    return null;
  }

  return findZonaFilmData(payload);
};

const getZonaSeasonLink = (
  filmSlug: string,
  seasonSlug: string,
): string => (
  `${ZONA_BASE_URL}/tvseries/${filmSlug}/season-${seasonSlug}`
);

const parseZonaSeason = (
  data: ZonaFilmData,
  seasonSlug: string,
): SeasonInterface => {
  const seasonData = data.seasons?.find(
    (season) => season.slug === seasonSlug,
  );

  const episodes: EpisodeInterface[] = (data.episodes ?? [])
    .filter((episode) => !episode.is_banned)
    .sort((a, b) => a.part - b.part)
    .map((episode) => ({
      name: episode.title,
      episodeId: String(episode.part),
    }));

  console.log('[ZONA SEASON DATA]', {
    seasonSlug,
    seasonPart: seasonData?.part ?? null,
    episodeCount: data.episodes?.length ?? 0,
    episodes: (data.episodes ?? [])
      .filter((episode) => !episode.is_banned)
      .sort((a, b) => a.part - b.part)
      .map((episode) => ({
        part: episode.part,
        slug: episode.slug,
        title: episode.title,
      })),
  });

  return {
    name: `Сезон ${seasonData?.part ?? Number(seasonSlug)}`,
    seasonId: seasonSlug,
    episodes,
  };
};

export const getZonaSeasons = async (
  link: string,
): Promise<SeasonInterface[]> => {
  const entity = await getZonaMetadata(link);

  if (!entity || entity.entityType !== 'series') {
    return [];
  }

  return (entity.data.seasons ?? [])
    .filter((season) => !season.is_banned)
    .sort((a, b) => a.part - b.part)
    .map((season) => ({
      name: `Сезон ${season.part}`,
      seasonId: season.slug,
      episodes: [],
    }));
};

export const getZonaSeasonEpisodes = async (
  link: string,
  seasonId: string,
): Promise<SeasonInterface | null> => {
  const entity = await getZonaMetadata(link);

  if (!entity || entity.entityType !== 'series') {
    return null;
  }

  const seasonLink = getZonaSeasonLink(
    entity.data.slug,
    seasonId,
  );

  const seasonEntity = await getZonaMetadata(seasonLink);

  if (!seasonEntity || seasonEntity.entityType !== 'series') {
    return null;
  }

  return parseZonaSeason(
    seasonEntity.data,
    seasonId,
  );
};


const getZonaSeriesInfo = async (
  entity: ZonaRscEntity,
): Promise<string | undefined> => {
  if (entity.entityType !== 'series') {
    return undefined;
  }
  if (!(entity.data.seasons ?? []).length) {
    return entity.data.series_ended === 1 ? 'завершён' : undefined;
  }

  const seasons = (entity.data.seasons ?? [])
    .filter((season) => !season.is_banned)
    .sort((a, b) => b.part - a.part);

  if (!seasons.length) {
    return undefined;
  }

  const latestSeason = seasons[0];
  const seasonLink = getZonaSeasonLink(
    entity.data.slug,
    latestSeason.slug,
  );

  const seasonEntity = await getZonaMetadata(seasonLink);

  if (
    !seasonEntity
    || seasonEntity.entityType !== 'series'
  ) {
    return `Сезон ${latestSeason.part}`;
  }

  const releasedEpisodes = (seasonEntity.data.episodes ?? [])
    .filter((episode) => !episode.is_banned)
    .filter((episode) => (
      !episode.release_date
      || new Date(episode.release_date).getTime() <= Date.now()
    ))
    .filter((episode) => (
      episode.meta?.media_id === undefined
      || episode.meta.media_id !== null
    ))
    .sort((a, b) => a.part - b.part);

  const latestEpisode = releasedEpisodes[releasedEpisodes.length - 1];
  // Zero is also used for unknown status by Zona, including completed series.
  const status = entity.data.series_ended === 1 ? 'завершён' : undefined;

  if (!latestEpisode) {
    return [`Сезон ${latestSeason.part}`, status].filter(Boolean).join(' • ');
  }

  return [`Сезон ${latestSeason.part}`, `серия ${latestEpisode.part}`, status].filter(Boolean).join(' • ');
};

const parseZonaFilmData = (
  data: ZonaFilmData,
  entityType: 'movie' | 'series',
): FilmInterface => {
  const link = `${ZONA_BASE_URL}/${entityType === 'movie' ? 'movies' : 'tvseries'}/${data.slug}`;
  const type = classifyZonaContent(entityType, data);

  const externalIds: FilmInterface['externalIds'] = {};

  if (data.kp_id) {
    externalIds.kinopoisk = String(data.kp_id);
  }

  const imdbRating = (
    typeof data.rating_imdb === 'number'
    && Number.isFinite(data.rating_imdb)
    && data.rating_imdb > 0
  )
    ? data.rating_imdb
    : undefined;

  const kinopoiskRating = (
    typeof data.rating_kp === 'number'
    && Number.isFinite(data.rating_kp)
    && data.rating_kp > 0
  )
    ? data.rating_kp
    : undefined;

  const zonaRating = (
    typeof data.rating === 'number'
    && Number.isFinite(data.rating)
    && data.rating > 0
  )
    ? data.rating
    : undefined;

  const ratingVotes = (
    typeof data.rating_count === 'number'
    && Number.isFinite(data.rating_count)
    && data.rating_count >= 0
  )
    ? data.rating_count
    : 0;

  const ratings: FilmInterface['ratings'] = [];

  if (imdbRating !== undefined) {
    ratings.push({
      text: `IMDb ${imdbRating}`,
      name: 'IMDb',
      rating: imdbRating,
      votes: undefined,
    });
  }

  if (kinopoiskRating !== undefined) {
    ratings.push({
      text: `Кинопоиск ${kinopoiskRating}`,
      name: 'Кинопоиск',
      rating: kinopoiskRating,
      votes: undefined,
    });
  }

  const mainRating: FilmInterface['mainRating'] = (
    zonaRating !== undefined
  )
    ? {
        text: `${zonaRating} (${ratingVotes})`,
        name: 'Zona',
        rating: zonaRating,
        votes: ratingVotes,
      }
    : undefined;

  const directors: ActorCardInterface[] = (
    typeof data.directors === 'string'
      ? data.directors
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({
          name,
          photo: '',
          job: 'Режиссёр',
          isDirector: true,
        }))
      : []
  );

  const actors: ActorCardInterface[] = (
    data.meta?.actors ?? []
  ).map((actor) => ({
    name: actor.name,
    photo: actor.cover_url ?? '',
    job: actor.role,
  }));

  const zonaTags = data.meta?.tags ?? [];

  const genres: CollectionItemInterface[] = zonaTags
    .filter((tag) => tag.type !== 'country')
    .map((tag) => ({
      name: tag.title,
      link: ZONA_BASE_URL + '/' + (entityType === 'movie' ? 'movies' : 'tvseries') + '/filter/genre-' + tag.slug,
    }));

  const countries: CollectionItemInterface[] = zonaTags
    .filter((tag) => tag.type === 'country')
    .map((tag) => ({
      name: tag.title,
      link: ZONA_BASE_URL + '/' + (entityType === 'movie' ? 'movies' : 'tvseries') + '/filter/country-' + tag.slug,
    }));

  if (__DEV__) {
    console.log('[ZONA METADATA]', JSON.stringify({
      slug: data.slug,
      rating: data.rating,
      rating_kp: data.rating_kp,
      rating_imdb: data.rating_imdb,
      rating_count: data.rating_count,
      age_limit: data.age_limit,
      duration: data.duration,
      directors: data.directors,
      actors: data.meta?.actors,
      tags: data.meta?.tags,
    }));
  }

  const zonaVoice: FilmVoiceInterface = {
    id: 'zona',
    identifier: 'zona',
    title: 'Zona',
    isCamrip: '0',
    isDirector: '0',
    isAds: '0',
    isPremium: false,
    isActive: true,
  };

  return {
    id: data.slug,
    link,
    type,
    title: data.title,
    originalTitle: data.title_original ?? undefined,
    poster: data.cover_url ?? '',
    largePoster: data.backdrop_url,
    description: data.description,
    releaseDate: data.release_date ?? data.release_date_ru ?? (data.year ? String(data.year) : undefined),
    duration: formatZonaDuration(data.duration),
    age: (
      typeof data.age_limit === 'number'
      && Number.isFinite(data.age_limit)
      && data.age_limit > 0
    )
      ? `${data.age_limit}+`
      : undefined,
    directors,
    actors,
    genres,
    countries,
    externalIds,
    franchise: (data.meta?.sequels ?? [])
      .filter(item => item.slug && item.title && (item.type === 'movie' || item.type === 'series'))
      .map(item => ({
        name: item.title, year: item.year ? String(item.year) : '',
        rating: typeof item.rating === 'number' ? String(Number(item.rating.toFixed(2))) : '',
        link: ZONA_BASE_URL + '/' + (item.type === 'series' ? 'tvseries' : 'movies') + '/' + item.slug,
      })),
    related: (data.meta?.relations ?? [])
      .filter(item => item.slug && item.title && (item.type === 'movie' || item.type === 'series'))
      .map(item => ({
        id: 'ZONA:' + item.slug,
        link: ZONA_BASE_URL + '/' + (item.type === 'series' ? 'tvseries' : 'movies') + '/' + item.slug,
        title: item.title, poster: item.cover_url ?? '',
        type: classifyZonaContent(item.type!, item),
        isEpisodic: item.type === 'series',
        subtitle: item.year ? String(item.year) : '',
        ratingSourceType: ContentSource.ZONA,
        ratings: { imdb: item.rating_imdb ?? undefined, kinopoisk: item.rating_kp ?? undefined },
      })),
    ratingScale: 10,
    ratings: ratings.length ? ratings : undefined,
    mainRating,
    // Uploaded media/quality are availability evidence; a catalog entry alone is not.
    isPendingRelease: (typeof data.meta?.media_id === 'number' && data.meta.media_id > 0)
      || Boolean(data.best_quality?.trim()) ? false
        : data.release_date && new Date(data.release_date).getTime() > Date.now() ? true : undefined,
    voices: [zonaVoice],
    hasVoices: true,
    hasSeasons: entityType === 'series',
  };
};

interface ZonaSearchResult {
  title: string;
  title_original?: string | null;
  title_eng?: string | null;
  all_titles?: string;
  spell_field?: string;
  slug: string;
  id: number;
  year?: number;
  popularity?: number;
  rating?: number;
  rating_kp?: number | null;
  rating_imdb?: number | null;
  domain_id?: number;
  type: 'movie' | 'series';
  cover_url?: string;
  is_abused?: number;
  is_own_abused?: number;
  is_published?: number;
  is_manifest?: number;
}

interface ZonaSearchPayload {
  data: ZonaSearchResult[];
  query: string;
  params: Record<string, unknown>;
}

const extractZonaSearchPayload = (html: string): ZonaSearchPayload | null => {
  const findSearch = (value: unknown): ZonaSearchPayload | null => {
    if (!value || typeof value !== 'object') return null;
    if ('data' in value && Array.isArray(value.data) && 'query' in value && typeof value.query === 'string') {
      return value as ZonaSearchPayload;
    }
    for (const child of Object.values(value)) {
      const found = findSearch(child);
      if (found) return found;
    }
    return null;
  };
  for (const match of html.matchAll(/self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)/gs)) {
    let decoded: string;
    try { decoded = JSON.parse('"' + match[1] + '"') as string; } catch { continue; }
    for (const line of decoded.split('\n')) {
      const separator = line.indexOf(':');
      if (separator < 0) continue;
      try {
        const found = findSearch(JSON.parse(line.slice(separator + 1)));
        if (found) return found;
      } catch { continue; }
    }
  }
  return null;
};
const extractZonaSearchCards = (
  html: string,
): FilmCardInterface[] => {
  const payload = extractZonaSearchPayload(html);

  if (!payload) {
    return [];
  }

  return payload.data.flatMap((result): FilmCardInterface[] => {
    if (
      !result.slug
      || !result.title
      || (result.type !== 'movie' && result.type !== 'series')
    ) {
      return [];
    }

    const type = result.type === 'series'
      ? FilmType.SERIES
      : FilmType.FILM;

    const link = `${ZONA_BASE_URL}/${
      result.type === 'series' ? 'tvseries' : 'movies'
    }/${result.slug}`;

    const imdbRating = (
      typeof result.rating_imdb === 'number'
      && Number.isFinite(result.rating_imdb)
      && result.rating_imdb > 0
    ) ? result.rating_imdb : undefined;

    const kinopoiskRating = (
      typeof result.rating_kp === 'number'
      && Number.isFinite(result.rating_kp)
      && result.rating_kp > 0
    ) ? result.rating_kp : undefined;

    const ratings = (
      imdbRating !== undefined
      || kinopoiskRating !== undefined
    ) ? {
      ...(imdbRating !== undefined ? { imdb: imdbRating } : {}),
      ...(kinopoiskRating !== undefined ? { kinopoisk: kinopoiskRating } : {}),
    } : undefined;

    return [{
      id: link,
      link,
      type,
      poster: result.cover_url ?? '',
      title: result.title,
      subtitle: result.year !== undefined
        ? String(result.year)
        : '',
      info: undefined,
      ratings,
    }];
  });
};
const fetchZonaSearch = async (
  query: string,
  enrich = true,
  onProgress?: (result: FilmListInterface) => void,
): Promise<FilmListInterface> => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      films: [],
      totalPages: 1,
    };
  }

  const url = `${ZONA_BASE_URL}/search/${encodeURIComponent(normalizedQuery)}`;
  const html = await fetchZonaText(url);
  const films = extractZonaSearchCards(html);
  if (!enrich) return { films, totalPages: 1 };
  onProgress?.({ films: films.map(film => ({
    ...film, contentTypePending: true,
    ratings: { ...film.ratings, imdbPending: !film.ratings?.imdb },
  })), totalPages: 1 });

  const enrichedFilms = films.map(film => ({
    ...film, contentTypePending: true,
    ratings: { ...film.ratings, imdbPending: !film.ratings?.imdb },
  }));
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, films.length) }, async () => {
    while (next < films.length) {
      const index = next++;
      const film = films[index];
      const enrichFilm = async (): Promise<FilmCardInterface> => {
      try {
        const entity = await getZonaMetadata(film.link);


        if (!entity) {
          return enrichedFilms[index];
        }

        const imdb = (
          typeof entity.data.rating_imdb === 'number'
          && Number.isFinite(entity.data.rating_imdb)
          && entity.data.rating_imdb > 0
        ) ? entity.data.rating_imdb : undefined;

        const kinopoisk = (
          typeof entity.data.rating_kp === 'number'
          && Number.isFinite(entity.data.rating_kp)
          && entity.data.rating_kp > 0
        ) ? entity.data.rating_kp : undefined;

        const ratings = (
          imdb !== undefined || kinopoisk !== undefined
        ) ? {
          ...film.ratings,
          ...(imdb !== undefined ? { imdb } : {}),
          ...(kinopoisk !== undefined ? { kinopoisk } : {}),
        } : film.ratings;

        const info = film.info;

        return {
          ...film,
          type: classifyZonaContent(entity.entityType, entity.data),
          contentTypePending: false,
          originalTitle: entity.data.title_original ?? film.originalTitle,
          subtitle: subtitleFromFilm(parseZonaFilmData(entity.data, entity.entityType)),
          externalIds: {
            ...film.externalIds,
            ...(entity.data.kp_id ? { kinopoisk: String(entity.data.kp_id) } : {}),
          },
          ratings: { ...ratings, imdbPending: false },
          info,
        };
      } catch (error) {
        if (__DEV__) {
          console.warn(
            '[ZONA SEARCH STATUS] Failed to enrich search card',
            film.link,
            error,
          );
        }

        return enrichedFilms[index];
      }
      };
      const enriched = await enrichFilm();
      enrichedFilms[index] = { ...enriched, contentTypePending: Boolean(enriched.contentTypePending),
        ratings: { ...enriched.ratings, imdbPending: Boolean(enriched.ratings?.imdbPending) } };
      onProgress?.({ films: enrichedFilms.slice(), totalPages: 1 });
    }
  }));

  return {
    films: enrichedFilms,
    totalPages: 1,
  };
};

const metadataCache = new Map<string, { time: number; value: Promise<ZonaRscEntity | null> }>();
const getZonaMetadata = (link: string) => {
  const cached = metadataCache.get(link);
  if (cached && Date.now() - cached.time < 5 * 60 * 1000) return cached.value;
  const value = fetchZonaEntity(link).catch(() => null).then((entity) => {
    if (!entity) metadataCache.delete(link);
    return entity;
  });
  metadataCache.set(link, { time: Date.now(), value });
  return value;
};

export const getZonaCatalogFilms = async (
  link: string,
  page: number,
  options?: { deferMetadata?: boolean },
): Promise<FilmListInterface> => {
  const url = new URL(link);
  if (!url.hostname.endsWith('.zona.im')) throw new Error('Invalid Zona catalog URL');
  url.searchParams.set('page', String(page));
  const html = await fetchZonaText(url.toString());
  const findCatalog = (value: unknown): { entities: ZonaFilmData[]; isNextPage?: boolean; initialPage?: number } | null => {
    if (!value || typeof value !== 'object') return null;
    if ('entities' in value && Array.isArray(value.entities)) {
      return value as { entities: ZonaFilmData[]; isNextPage?: boolean; initialPage?: number };
    }
    if ('collectionSlug' in value && 'data' in value && Array.isArray(value.data)) {
      return { entities: value.data as ZonaFilmData[], initialPage: 'initialPage' in value ? Number(value.initialPage) : 1, isNextPage: false };
    }
    for (const child of Object.values(value)) {
      const found = findCatalog(child);
      if (found) return found;
    }
    return null;
  };
  for (const match of html.matchAll(/self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)/gs)) {
    const decoded = JSON.parse('"' + match[1] + '"') as string;
    for (const line of decoded.split('\n')) {
      const separator = line.indexOf(':');
      if (separator < 0) continue;
      let record: unknown;
      try { record = JSON.parse(line.slice(separator + 1)); } catch { continue; }
      const catalog = findCatalog(record);
      if (!catalog) continue;
      if (catalog.initialPage && catalog.initialPage !== page) {
        throw new Error('Zona returned a different catalog page');
      }
      const defaultEntityType = url.pathname.includes('/tvseries') ? 'series' : 'movie';
      const films: FilmCardInterface[] = new Array(catalog.entities.length);
      let next = 0;
      await Promise.all(Array.from({ length: Math.min(4, catalog.entities.length) }, async () => {
        while (next < catalog.entities.length) {
          const index = next++;
          const data = catalog.entities[index];
          const entityType = data.type ?? defaultEntityType;
          const link = ZONA_BASE_URL + '/' + (entityType === 'series' ? 'tvseries' : 'movies') + '/' + data.slug;
          const entity = options?.deferMetadata || data.meta?.tags?.length ? null : await getZonaMetadata(link);
          const film = parseZonaFilmData(entity?.data ?? data, entity?.entityType ?? entityType);
          const type = url.pathname.includes('genre-anime') ? FilmType.ANIME
            : url.pathname.includes('genre-multfilm') ? FilmType.CARTOON : film.type;
          films[index] = {
            id: film.id, link: film.link, title: film.title, originalTitle: film.originalTitle,
            poster: film.poster, type, isPendingRelease: film.isPendingRelease,
            contentTypePending: Boolean(options?.deferMetadata && !data.meta?.tags?.length && !url.pathname.includes('genre-anime') && !url.pathname.includes('genre-multfilm')),
            subtitle: buildFilmSubtitle(data.year, film.countries?.map((country) => country.name), film.genres?.map((genre) => genre.name)),
            info: entityType === 'series' && entity ? await getZonaSeriesInfo(entity) : undefined,
            externalIds: film.externalIds,
            ratingSourceType: ContentSource.ZONA,
            ratingFilmId: film.link,
            ratings: {
              ...(options?.deferMetadata && !data.meta?.tags?.length ? { imdbPending: true } : {}),
              ...(data.rating_imdb && data.rating_imdb > 0 ? { imdb: data.rating_imdb } : {}),
              ...(data.rating_kp && data.rating_kp > 0 ? { kinopoisk: data.rating_kp } : {}),
            },
          };
        }
      }));
      return {
        films,        totalPages: catalog.isNextPage ? page + 1 : page,
      };
    }
  }
  throw new Error('Zona catalog metadata not found');
};

const ZonaSourceAdapter: SourceAdapter = {
  getCollections: getZonaCollections,
  getFilms: getZonaCatalogFilms,
  async getFilmRatings(filmId: string) {
    const link = filmId.startsWith('https://') ? filmId : ZONA_BASE_URL + '/movies/' + filmId;
    const entity = await getZonaMetadata(link);
    return entity ? {
      ...(entity.data.rating_imdb && entity.data.rating_imdb > 0 ? { imdb: entity.data.rating_imdb } : {}),
      ...(entity.data.rating_kp && entity.data.rating_kp > 0 ? { kinopoisk: entity.data.rating_kp } : {}),
    } : {};
  },
  source: ContentSource.ZONA,
  name: 'Zona',

  async getFilm(link: string, options?: { deferSeriesInfo?: boolean }): Promise<FilmInterface | null> {
    const entity = await getZonaMetadata(link);

    if (!entity) {
      return null;
    }

    const film = parseZonaFilmData(
      entity.data,
      entity.entityType,
    );

    const seasonSlug = entity.seasonSlug ?? entity.defaultSeasonSlug;
    const season = entity.data.seasons?.find(item => item.slug === seasonSlug);
    const datedEpisodes = (entity.data.episodes ?? [])
      .filter(item => !item.is_banned && item.release_date && Number.isFinite(Date.parse(item.release_date)))
      .sort((a, b) => a.part - b.part);
    if (entity.entityType === 'series' && season && datedEpisodes.length) {
      film.schedule = [{
        name: 'Сезон ' + season.part,
        items: datedEpisodes.map(episode => ({
          id: season.slug + ':' + episode.slug,
          name: 'Серия ' + episode.part,
          episodeName: episode.title,
          episodeNameOriginal: episode.title_original ?? undefined,
          date: episode.release_date!,
          releaseDate: episode.release_date,
          isReleased: Date.parse(episode.release_date!) <= Date.now(),
        })),
      }];
    }

    if (entity.entityType === 'series' && !options?.deferSeriesInfo) {
      film.seriesInfo = await getZonaSeriesInfo(entity);
      if (film.seriesInfo && /серия \d+/.test(film.seriesInfo)) {
        film.isPendingRelease = false;
      }
    }

    return film;
  },

  async searchCandidates(query: string, page: number): Promise<FilmListInterface> {
    return page === 1 ? fetchZonaSearch(query, false) : { films: [], totalPages: 1 };
  },

  async search(
    query: string,
    _page: number,
    options?: { background?: boolean; onProgress?: (result: FilmListInterface) => void },
  ): Promise<FilmListInterface> {
    return _page === 1 ? fetchZonaSearch(query, true, options?.onProgress) : { films: [], totalPages: 1 };
  },

  normalizeFilmCard(film: FilmCardInterface): UnifiedFilm {
    const yearMatch = `${film.subtitle} ${film.info ?? ''}`.match(
      /\b(19|20)\d{2}\b/,
    );

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
        `ZONA:${film.id}`,
      ),
      title: film.title,
      originalTitle: film.originalTitle,
      year,
      type: film.type,
      poster: film.poster,
      info: film.info,
      contentTypePending: film.contentTypePending,
      isPendingRelease: film.isPendingRelease,
      subtitle: film.subtitle,
      ratings: film.ratings,
      sources: [
        {
          source: ContentSource.ZONA,
          externalIds,
          link: film.link,
          nativeId: film.link,
        },
      ],
    };
  },

  normalizeFilm(film: FilmInterface): UnifiedFilm {
    const externalIds = this.getExternalIds(film);
    const year = film.releaseDate
      ? Number(film.releaseDate.slice(0, 4))
      : undefined;

    return {
      id: createUnifiedFilmId(
        externalIds,
        film.originalTitle,
        film.title,
        year,
        film.type,
        `ZONA:${film.id}`,
      ),
      title: film.title,
      originalTitle: film.originalTitle,
      year,
      type: film.type,
      poster: film.poster,
      largePoster: film.largePoster,
      description: film.description,
      releaseDate: film.releaseDate,
      subtitle: subtitleFromFilm(film),
      ratings: film.ratings?.reduce<NonNullable<UnifiedFilm['ratings']>>(
        (result, rating) => {
          if (rating.name === 'IMDb') {
            result.imdb = rating.rating;
          }

          if (rating.name === 'Кинопоиск') {
            result.kinopoisk = rating.rating;
          }

          if (rating.name === 'Zona') {
            result.zona = rating.rating;
          }

          return result;
        },
        {},
      ),
      sources: [
        {
          source: ContentSource.ZONA,
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

export default ZonaSourceAdapter;
