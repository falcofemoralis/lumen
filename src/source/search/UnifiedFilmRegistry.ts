import { UnifiedFilm } from '../types/UnifiedFilm';
import { SourceResolver } from '../resolver/SourceResolver';

const filmsByLink = new Map<string, UnifiedFilm>();

const cloneFilm = (film: UnifiedFilm): UnifiedFilm => ({
  ...film,
  ratings: film.ratings ? { ...film.ratings } : undefined,
  sources: film.sources.map((source) => ({
    ...source,
    externalIds: source.externalIds.map((externalId) => ({ ...externalId })),
  })),
});

export const registerUnifiedFilm = (film: UnifiedFilm): void => {
  const resolver = new SourceResolver([]);
  const known = film.sources.flatMap((source) => {
    const existing = filmsByLink.get(source.link);
    return existing ? [existing] : [];
  });
  const merged = resolver.deduplicate([...known, film])[0] ?? film;
  merged.sources.forEach((source) => {
    filmsByLink.set(source.link, cloneFilm(merged));
  });
};

export const getRegisteredUnifiedFilm = (
  link: string,
): UnifiedFilm | undefined => {
  const film = filmsByLink.get(link);

  return film ? cloneFilm(film) : undefined;
};

export const clearUnifiedFilmRegistry = (): void => {
  filmsByLink.clear();
};
