import { loadFilteredPages, FilteredPageCursor } from './FilteredPages';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';

import { ContentSource } from '../types/ContentSource';
import { isSourceEnabled, enabledSourceKey } from '../types/SourceSelection';
import { SourceAdapter } from '../types/SourceAdapter';
import { UnifiedFilm } from '../types/UnifiedFilm';
import { SourceResolver } from '../resolver/SourceResolver';
import { isTitleVariantCandidate } from '../resolver/titleCandidates';
import { withDeadline } from '../request';
import { registerUnifiedFilm } from './UnifiedFilmRegistry';

export interface UnifiedSearchOptions {
  sources?: ContentSource[];
  loadSource: (adapter: SourceAdapter, page: number, onProgress?: (result: FilmListInterface) => void) => Promise<FilmListInterface>;
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
    films: UnifiedFilm[]; cursors: Map<ContentSource, FilteredPageCursor>;
  }
>();

const getQueryState = (
  query: string,
  page: number,
): { films: UnifiedFilm[]; cursors: Map<ContentSource, FilteredPageCursor> } => {
  if (page === 1 || !queryStates.has(query)) {
    const state = { films: [] as UnifiedFilm[], cursors: new Map<ContentSource, FilteredPageCursor>() };
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
    originalTitle: film.originalTitle,
    sources: film.sources,
    externalIds: Object.fromEntries(film.sources.flatMap(source => source.externalIds).flatMap(id =>
      id.type === 'IMDB' ? [['imdb', id.value]] : id.type === 'TMDB' ? [['tmdb', id.value]] : id.type === 'KINOPOISK' ? [['kinopoisk', id.value]] : [])),
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

      const searchSources = SEARCH_SOURCES.filter((source) => Boolean(getAdapter(source)) && isSourceEnabled(source)
        && (!options?.sources || options.sources.includes(source)));
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
            if (!options) return publish(adapter, await adapter.search(query.trim(), page, { onProgress: partialResult => publish(adapter, partialResult) }));
            const cursor = state.cursors.get(source) ?? { next: 1, exhausted: false };
            state.cursors.set(source, cursor);
            const result = await loadFilteredPages(cursor, page,
              async sourcePage => {
                let completed = false;
                try {
                  return await options.loadSource(adapter, sourcePage, sourceResult => {
                    if (page !== 1 || sourcePage !== 1) return;
                    void Promise.all(sourceResult.films.map(card => options.prepareCard(card, adapter))).then(cards => {
                      if (!completed) publish(adapter, {
                        ...sourceResult, films: cards.filter((card): card is FilmCardInterface => !!card),
                      });
                    }).catch(() => {});
                  });
                } finally {
                  completed = true;
                }
              },
              card => options.prepareCard(card, adapter));
            return publish(adapter, result);
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

      // Only ambiguous localized subtitles need a detail request. Never merge by a prefix alone.
      const candidates = unifiedFilms.filter(film => film.sources.some(source => source.source === ContentSource.REZKA)
        && [...state.films, ...unifiedFilms].some(other => other !== film
          && other.sources.some(source => source.source !== ContentSource.REZKA)
          && !sourceResolver.isSameFilm(film, other) && isTitleVariantCandidate(film, other)));
      if (candidates.length <= 3) await Promise.all(candidates.map(async film => {
        const adapter = getAdapter(ContentSource.REZKA);
        const source = film.sources.find(source => source.source === ContentSource.REZKA);
        if (!adapter || !source) return;
        const details = await withDeadline(adapter.getFilm(source.link, { background: true }), 12_000).catch(() => null);
        if (!details) return;
        const metadata = adapter.normalizeFilm(details);
        // Preserve already displayed identity, ratings and the other source links.
        film.originalTitle = metadata.originalTitle ?? film.originalTitle;
        film.year = metadata.year ?? film.year;
        film.type = metadata.type;
        const externalIds = metadata.sources.find(item => item.source === ContentSource.REZKA)?.externalIds;
        if (externalIds?.length) source.externalIds = externalIds;
      }));

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


