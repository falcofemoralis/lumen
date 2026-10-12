import { matchingOriginalTitles } from './titleCandidates';
import { FilmType } from 'Type/FilmType.type';
import { isSourceEnabled } from '../types/SourceSelection';
import { decode } from 'html-entities';

import {
  ContentSource,
  CONTENT_SOURCE_PRIORITY,
} from '../types/ContentSource';
import { SourceAdapter } from '../types/SourceAdapter';
import {
  UnifiedExternalId,
  UnifiedExternalIdType,
  UnifiedFilm,
  createUnifiedFilmId,
} from '../types/UnifiedFilm';

const EXTERNAL_ID_PRIORITY: UnifiedExternalIdType[] = [
  UnifiedExternalIdType.IMDB,
  UnifiedExternalIdType.TMDB,
  UnifiedExternalIdType.ANILIST,
  UnifiedExternalIdType.MAL,
  UnifiedExternalIdType.KINOPOISK,
  UnifiedExternalIdType.OTHER,
];

const normalizeExternalId = (value: string): string => (
  value.trim().toLowerCase()
);

const normalizeTitle = (value: string): string => (
  decode(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\u0451/g, '\u0435')
    .replace(/[^a-z\u0430-\u044f0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const getContentIdentity = (film: UnifiedFilm): string | null => {
  if (!film.year) {
    return null;
  }

  const title = normalizeTitle(film.title);

  if (!title) {
    return null;
  }

  return [title, film.year, film.type].join('|');
};

const getFilmExternalIds = (
  film: UnifiedFilm,
): UnifiedExternalId[] => film.sources.flatMap(
  (source) => source.externalIds,
);

const getExternalIdsByType = (
  film: UnifiedFilm,
  type: UnifiedExternalIdType,
): Set<string> => new Set(
  getFilmExternalIds(film)
    .filter((externalId) => externalId.type === type)
    .map((externalId) => normalizeExternalId(externalId.value))
    .filter(Boolean),
);

const getFirstSharedExternalIdType = (
  first: UnifiedFilm,
  second: UnifiedFilm,
): UnifiedExternalIdType | null => {
  for (const type of EXTERNAL_ID_PRIORITY) {
    const firstIds = getExternalIdsByType(first, type);
    const secondIds = getExternalIdsByType(second, type);

    if (!firstIds.size || !secondIds.size) {
      continue;
    }

    return type;
  }

  return null;
};

const hasMatchingExternalId = (
  first: UnifiedFilm,
  second: UnifiedFilm,
): boolean => {
  const type = getFirstSharedExternalIdType(first, second);

  if (!type) {
    return false;
  }

  const firstIds = getExternalIdsByType(first, type);
  const secondIds = getExternalIdsByType(second, type);

  return Array.from(firstIds).some((id) => secondIds.has(id));
};

const hasConflictingExternalId = (
  first: UnifiedFilm,
  second: UnifiedFilm,
): boolean => {
  const type = getFirstSharedExternalIdType(first, second);

  if (!type) {
    return false;
  }

  const firstIds = getExternalIdsByType(first, type);
  const secondIds = getExternalIdsByType(second, type);

  return !Array.from(firstIds).some((id) => secondIds.has(id));
};

const hasSameSourceIdentity = (
  first: UnifiedFilm,
  second: UnifiedFilm,
): boolean => {
  for (const firstSource of first.sources) {
    for (const secondSource of second.sources) {
      if (firstSource.source !== secondSource.source) {
        continue;
      }

      if ((firstSource.link && firstSource.link === secondSource.link)
        || (firstSource.nativeId && firstSource.nativeId === secondSource.nativeId)) {
        return true;
      }
    }
  }

  return false;
};

const hasSameIdentity = (
  first: UnifiedFilm,
  second: UnifiedFilm,
): boolean => {
  if (hasSameSourceIdentity(first, second)) {
    return true;
  }

  if (hasConflictingExternalId(first, second)) {
    return false;
  }

  if (hasMatchingExternalId(first, second)) {
    return true;
  }

  const firstIdentity = getContentIdentity(first);
  const secondIdentity = getContentIdentity(second);

  if (!firstIdentity || !secondIdentity) {
    return false;
  }

  if (first.originalTitle && second.originalTitle
    && !matchingOriginalTitles(first.originalTitle, second.originalTitle)) {
    return false;
  }
  const matchingOriginalTitle = Boolean(
    first.originalTitle && second.originalTitle
    && normalizeTitle(first.originalTitle)
    && matchingOriginalTitles(first.originalTitle, second.originalTitle),
  );
  return firstIdentity === secondIdentity || (
    matchingOriginalTitle && first.year === second.year && first.type === second.type
  );
};

const cloneSource = (
  source: UnifiedFilm['sources'][number],
): UnifiedFilm['sources'][number] => ({
  ...source,
  externalIds: source.externalIds.map((externalId) => ({ ...externalId })),
});

const mergeSources = (
  target: UnifiedFilm,
  incoming: UnifiedFilm,
): void => {
  if (!target.ratings && incoming.ratings) {
    target.ratings = { ...incoming.ratings };
  } else if (target.ratings && incoming.ratings) {
    target.ratings = {
      ...incoming.ratings,
      ...Object.fromEntries(Object.entries(target.ratings).filter(([, value]) => value !== undefined)),
    };
  }

  if (incoming.subtitle && (!target.subtitle ||
    incoming.subtitle.split(',').length > target.subtitle.split(',').length)) {
    target.subtitle = incoming.subtitle;
  }

  if (!target.info && incoming.info) {
    target.info = incoming.info;
  }

  // Anixart owns the animation classification and presentation when it arrives
  // after a supplemental source, including during pagination.
  if (incoming.sources.some((source) => source.source === ContentSource.ANIXART)
    && !target.sources.some((source) => source.source === ContentSource.ANIXART)) {
    target.type = incoming.type;
    target.title = incoming.title;
    target.originalTitle = incoming.originalTitle ?? target.originalTitle;
    target.poster = incoming.poster || target.poster;
    target.info = incoming.info ?? target.info;
    target.contentTypePending = incoming.contentTypePending;
  }
  if (target.isPendingRelease === false || incoming.isPendingRelease === false) target.isPendingRelease = false;
  else target.isPendingRelease ??= incoming.isPendingRelease;
  incoming.sources.forEach((source) => {
    const existingSource = target.sources.find(
      (item) => item.source === source.source && item.link === source.link,
    );

    if (!existingSource) {
      target.sources.push(cloneSource(source));

      return;
    }

    existingSource.nativeId ??= source.nativeId;
    source.externalIds.forEach((externalId) => {
      const normalizedValue = normalizeExternalId(externalId.value);
      const alreadyExists = existingSource.externalIds.some(
        (item) => (
          item.type === externalId.type
          && normalizeExternalId(item.value) === normalizedValue
        ),
      );

      if (!alreadyExists) {
        existingSource.externalIds.push({ ...externalId });
      }
    });
  });
};

export class SourceResolver {
  private readonly adapters: Map<ContentSource, SourceAdapter>;

  constructor(adapters: SourceAdapter[]) {
    this.adapters = new Map(
      adapters.map((adapter) => [adapter.source, adapter]),
    );
  }

  isSameFilm(first: UnifiedFilm, second: UnifiedFilm): boolean {
    return hasSameIdentity(first, second);
  }

  getAdapter(source: ContentSource): SourceAdapter | undefined {
    return this.adapters.get(source);
  }

  getAvailableSources(
    film: UnifiedFilm,
  ): ContentSource[] {
    const priority = (film.type === FilmType.ANIME || film.type === FilmType.DONGHUA)
      ? CONTENT_SOURCE_PRIORITY.ANIME
      : CONTENT_SOURCE_PRIORITY.DEFAULT;

    return priority.filter((source) => (isSourceEnabled(source) &&
      film.sources.some((item) => item.source === source)
    ));
  }

  getPreferredSource(
    film: UnifiedFilm,
  ): ContentSource | null {
    return this.getAvailableSources(film)[0] ?? null;
  }

  deduplicate(
    films: UnifiedFilm[],
  ): UnifiedFilm[] {
    const result: UnifiedFilm[] = [];

    films.forEach((film) => {
      const existing = result.find((item) => hasSameIdentity(item, film));

      if (!existing) {
        result.push({
          ...film,
          sources: film.sources.map(cloneSource),
        });

        return;
      }

      mergeSources(existing, film);

      const externalIds = getFilmExternalIds(existing);

      existing.id = createUnifiedFilmId(
        externalIds,
        existing.originalTitle,
        existing.title,
        existing.year,
        existing.type,
        existing.id,
      );
    });

    return result;
  }
}


