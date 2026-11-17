import type { FilmCardInterface } from '../../type/FilmCard.interface';
import type { LocalBookmarksBlob } from '../../type/LocalLibrary.interface';
import { SourceResolver, normalizeTitle } from '../../source/resolver/SourceResolver';
import { getRegisteredUnifiedFilm } from '../../source/search/UnifiedFilmRegistry';
import { ContentSource } from '../../source/types/ContentSource';
import { sourceForLink } from '../../source/types/SourceSelection';
import { UnifiedExternalIdType, type UnifiedFilm, type UnifiedFilmSource } from '../../source/types/UnifiedFilm';

const resolver = new SourceResolver([]);
const pathFor = (link: string): string => {
  try { return new URL(link, 'https://mirror.invalid').pathname.replace(/\/+$/, ''); }
  catch { return link; }
};
const idTypes = { imdb: UnifiedExternalIdType.IMDB, tmdb: UnifiedExternalIdType.TMDB, kinopoisk: UnifiedExternalIdType.KINOPOISK };

export const bookmarkFilmIdentity = (card: FilmCardInterface): UnifiedFilm => {
  const source = sourceForLink(card.link);
  const prefix = source + ':';
  const nativeId = card.id.startsWith(prefix) ? card.id.slice(prefix.length)
    : source === ContentSource.ANIXART ? pathFor(card.link).match(/^\/release\/(\d+)/)?.[1]
      : source === ContentSource.REZKA ? pathFor(card.link).match(/\/(\d+)-/)?.[1] ?? (/^\d+$/.test(card.id) ? card.id : undefined)
        : undefined;
  const externalIds = Object.entries(card.externalIds ?? {}).flatMap(([key, value]) => value && key in idTypes
    ? [{ type: idTypes[key as keyof typeof idTypes], value }] : []);
  const external = card.id.match(/^EXTERNAL:(IMDB|TMDB|KINOPOISK|ANILIST|MAL):(.+)$/);
  if (external && !externalIds.some(id => id.type === external[1])) externalIds.push({ type: external[1] as UnifiedExternalIdType, value: external[2] });
  const sources = [...(card.sources ?? []), ...(getRegisteredUnifiedFilm(card.link)?.sources ?? []),
    { source, link: card.link, nativeId, externalIds }];
  return {
    id: card.id, title: card.title, originalTitle: card.originalTitle, type: card.type, poster: card.poster,
    year: Number(card.subtitle?.match(/\b(?:18|19|20|21)\d{2}\b/)?.[0] ?? card.id.match(/^CONTENT:[^:]+:(\d{4}):/)?.[1]) || undefined,
    sources,
  };
};

const keysFor = (film: UnifiedFilm): string[] => [
  'id:' + film.id,
  ...film.sources.flatMap(source => [
    ...(source.nativeId ? ['native:' + source.source + ':' + source.nativeId] : []),
    ...(source.link ? ['link:' + source.source + ':' + pathFor(source.link)] : []),
    ...source.externalIds.map(id => 'external:' + id.type + ':' + id.value.trim().toLowerCase()),
  ]),
  ...[film.title, film.originalTitle].filter(Boolean).map(title => 'content:' + normalizeTitle(title!) + ':' + film.year + ':' + film.type),
];
const canonicalLinks = (film: UnifiedFilm): UnifiedFilm => ({
  ...film, sources: film.sources.map(source => ({ ...source, link: pathFor(source.link) })),
});
type Index = { aliases: Map<string, Set<string>>; films: Map<string, UnifiedFilm> };
const indexes = new WeakMap<LocalBookmarksBlob, Index>();
const getIndex = (blob: LocalBookmarksBlob): Index => {
  const known = indexes.get(blob); if (known) return known;
  const aliases = new Map<string, Set<string>>(), films = new Map<string, UnifiedFilm>();
  for (const [id, card] of Object.entries(blob.films)) {
    const identity = bookmarkFilmIdentity(card); films.set(id, canonicalLinks(identity));
    for (const key of keysFor(identity)) {
      if (!aliases.has(key)) aliases.set(key, new Set());
      aliases.get(key)!.add(id);
    }
  }
  const index = { aliases, films }; indexes.set(blob, index); return index;
};

/** Match old source IDs to current unified cards; never rely on ID equality or fuzzy titles alone. */
export const matchingBookmarkIds = (blob: LocalBookmarksBlob, card: FilmCardInterface): string[] => {
  const index = getIndex(blob), identity = bookmarkFilmIdentity(card);
  const candidates = new Set(keysFor(identity).flatMap(key => [...(index.aliases.get(key) ?? [])]));
  const canonical = canonicalLinks(identity);
  return [...candidates].filter(id => resolver.isSameFilm(index.films.get(id)!, canonical));
};

export const mergeBookmarkSources = (first: FilmCardInterface | undefined, second: FilmCardInterface): UnifiedFilmSource[] => {
  const sources = new Map<string, UnifiedFilmSource>();
  for (const source of [...(first ? bookmarkFilmIdentity(first).sources : []), ...bookmarkFilmIdentity(second).sources]) {
    if (!source.link) continue;
    const key = source.source + ':' + (source.nativeId || pathFor(source.link));
    const old = sources.get(key);
    const ids = new Map([...(old?.externalIds ?? []), ...source.externalIds].map(id => [id.type + ':' + id.value.toLowerCase(), id]));
    sources.set(key, { ...old, ...source, externalIds: [...ids.values()] });
  }
  return [...sources.values()];
};
