import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';

import { ContentSource } from '../types/ContentSource';
import { isSourceEnabled, enabledSourceKey } from '../types/SourceSelection';
import { SourceAdapter } from '../types/SourceAdapter';
import { UnifiedFilm } from '../types/UnifiedFilm';
import { SourceResolver } from '../resolver/SourceResolver';
import { registerUnifiedFilm } from './UnifiedFilmRegistry';

export interface UnifiedSearchOptions {
  loadSource: (adapter: SourceAdapter, page: number) => Promise<FilmListInterface>;
  prepareCard: (card: FilmCardInterface, adapter: SourceAdapter) => Promise<FilmCardInterface | null>;
}

const SEARCH_SOURCES = [
  ContentSource.ANIXART,
  ContentSource.ZONA,
  ContentSource.REZKA,
] as const;

const queryStates = new Map<
  string,
  {
    films: UnifiedFilm[];
  }
>();

const getQueryState = (
  query: string,
  page: number,
): { films: UnifiedFilm[] } => {
  if (page === 1 || !queryStates.has(query)) {
    const state = { films: [] as UnifiedFilm[] };
    queryStates.set(query, state);

    return state;
  }

  return queryStates.get(query)!;
};

const toFilmCard = (
  film: UnifiedFilm,
  sourceResolver: SourceResolver,
): FilmCardInterface => {
  const preferredSource = sourceResolver.getPreferredSource(film);

  const preferredLink = preferredSource
    ? film.sources.find((source) => source.source === preferredSource)?.link
    : undefined;

  const ratingSource = film.sources.find(
    source => source.source === preferredSource && source.nativeId,
  ) ?? film.sources.find(source => source.nativeId && isSourceEnabled(source.source));
  return {
    id: film.id,
    link: preferredLink ?? film.sources[0]?.link ?? '',
    type: film.type,
    poster: film.poster,
    title: film.title,
    subtitle: film.subtitle || (film.year ? String(film.year) : ''),
    info: film.info,
    contentTypePending: film.contentTypePending,
    isPendingRelease: film.isPendingRelease,
    ratings: film.ratings,
    ratingSourceType: ratingSource?.source,
    ratingFilmId: ratingSource?.nativeId,
  };
};

export const createUnifiedSearchService = (
  sourceAdapters: SourceAdapter[],
  sourceResolver: SourceResolver,
) => {
  const getAdapter = (source: ContentSource): SourceAdapter | undefined => (
    sourceAdapters.find((adapter) => adapter.source === source)
  );

  return {
    async search(
      query: string,
      page: number,
      onUpdated?: (updates: { previousLink: string; card: FilmCardInterface }[]) => void,
      options?: UnifiedSearchOptions,
      onProgress?: (result: FilmListInterface) => void,
    ): Promise<FilmListInterface> {
      const normalizedQuery = query.trim() ? query.trim() + ':sources:' + enabledSourceKey() : '';

      if (!normalizedQuery) {
        return {
          films: [],
          totalPages: 1,
        };
      }

      const state = getQueryState(normalizedQuery, page);

      const searchSources = SEARCH_SOURCES.filter((source) => Boolean(getAdapter(source)) && isSourceEnabled(source));
      if (!searchSources.length) return { films: [], totalPages: 1 };
      const partial = new Map<ContentSource, UnifiedFilm[]>();
      const presentationIds = new Map<string, string>();
      const normalizeCard = (adapter: SourceAdapter, card: FilmCardInterface) => {
        const film = adapter.normalizeFilmCard(card);
        const key = adapter.source + ':' + card.link;
        const previous = presentationIds.get(key);
        if (previous) film.id = previous;
        else presentationIds.set(key, film.id);
        return film;
      };
      const publish = (adapter: SourceAdapter, result: FilmListInterface) => {
        if (page !== 1 || !onProgress) return result;
        partial.set(adapter.source, result.films.map((card) => normalizeCard(adapter, card)));
        const films = sourceResolver.deduplicate(searchSources.flatMap(source => partial.get(source) ?? []));
        films.forEach(registerUnifiedFilm);
        onProgress({ films: films.map((film) => toFilmCard(film, sourceResolver)), totalPages: 1 });
        return result;
      };
      const results = await Promise.all(
        searchSources.map(async (source) => {
          const adapter = getAdapter(source);

          if (!adapter) {
            return {
              films: [],
              totalPages: 1,
            };
          }

          try {
            const result = options ? await options.loadSource(adapter, page) : await adapter.search(query.trim(), page, { onProgress: partialResult => publish(adapter, partialResult) });
            if (!options) return publish(adapter, result);
            const prepared: (FilmCardInterface | null)[] = new Array(result.films.length);
            let next = 0;
            await Promise.all(Array.from({ length: Math.min(4, result.films.length) }, async () => {
              while (next < result.films.length) {
                const index = next++;
                prepared[index] = await options.prepareCard(result.films[index], adapter).catch(() => null);
              }
            }));
            return publish(adapter, { ...result, films: prepared.filter((card): card is FilmCardInterface => Boolean(card)) });
          } catch (error) {
            return { films: [], totalPages: page, error };
          }
        }),
      );

      if (results.every((result) => 'error' in result)) {
        throw (results[0] as { error: unknown }).error;
      }
      const unifiedFilms = results.flatMap((result, resultIndex) => {
        const adapter = getAdapter(searchSources[resultIndex]);

        if (!adapter) {
          return [];
        }

        return result.films.map((film) => normalizeCard(adapter, film));
      });

      const previousFilms = state.films;
      state.films = sourceResolver.deduplicate([
        ...state.films,
        ...unifiedFilms,
      ]);

      const updates: { previousLink: string; card: FilmCardInterface }[] = [];
      const newFilms = state.films.filter((film) => {
        const previous = previousFilms.find((item) => item.sources.some((source) => (
          film.sources.some((merged) => merged.source === source.source && merged.link === source.link)
        )));
        if (!previous) return true;
        film.id = previous.id;
        updates.push({ previousLink: toFilmCard(previous, sourceResolver).link, card: toFilmCard(film, sourceResolver) });
        return false;
      });
      state.films.forEach(registerUnifiedFilm);
      onUpdated?.(updates);

      const totalPages = Math.max(
        ...results.map((result) => result.totalPages),
        1,
      );

      return {
        films: newFilms.map((film) => toFilmCard(film, sourceResolver)),
        totalPages,
      };
    },
  };
};


