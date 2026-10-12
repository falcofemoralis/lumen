import { FilmInterface } from 'Type/Film.interface';
import { FilmType } from 'Type/FilmType.type';

export interface ContentFilters {
  from?: number;
  to?: number;
  includedCountries: string[];
  excludedCountries: string[];
  type?: FilmType;
  types?: FilmType[];
  genre?: string;
  genres?: string[];
  allowedCountries?: string[];
}
export const normalizeFilterValue = (value: string) => value.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').trim();
const GENRE_NAMES: Record<string, string> = {
  'боевики': 'боевик', 'экшен': 'боевик', 'драмы': 'драма',
  'комедии': 'комедия', 'триллеры': 'триллер', 'детективы': 'детектив',
  'мелодрамы': 'мелодрама', 'романтика': 'мелодрама', 'вестерны': 'вестерн',
  'военные': 'военный', 'военное': 'военный', 'исторические': 'исторический',
  'история': 'исторический', 'семейные': 'семейный', 'документальные': 'документальный',
  'биографии': 'биография', 'мюзиклы': 'мюзикл', 'спортивные': 'спорт',
};
export const normalizeGenreName = (value: string): string => {
  const name = normalizeFilterValue(value);
  return GENRE_NAMES[name] ?? name;
};

// A single genre may narrow the native catalog; several must retain the whole
// category so the first genre's URL does not silently exclude the others.
export const getGenreCatalogPath = (
  options: { name: string; value: string }[],
  selected: string[],
): string => {
  const path = selected.length === 1
    ? options.find((item) => item.name === selected[0])?.value : undefined;
  return (path || options[0]?.value || '/films/').replace('/best', '');
};

export const matchesContentFilters = (film: FilmInterface, filters: ContentFilters): boolean => {
  const year = film.year ?? Number(film.releaseDate?.match(/\b(18|19|20)\d{2}\b/)?.[0]);
  if (filters.from && (!year || year < filters.from)) return false;
  if (filters.to && (!year || year > filters.to)) return false;
  if (filters.type && film.type !== filters.type) return false;
  if (filters.types?.length && !filters.types.includes(film.type)) return false;
  const countries = (film.countries ?? []).map((item) => normalizeFilterValue(item.name));
  if (filters.excludedCountries.some((country) => countries.includes(normalizeFilterValue(country)))) return false;
  if (filters.includedCountries.length && !filters.includedCountries.some((country) => countries.includes(normalizeFilterValue(country)))) return false;
  if (filters.allowedCountries !== undefined &&
    !filters.allowedCountries.some((country) => countries.includes(normalizeFilterValue(country)))) return false;
  const genres = filters.genres ?? (filters.genre ? [filters.genre] : []);
  if (genres.length && !(film.genres ?? []).some((genre) =>
    genres.some((selected) => normalizeGenreName(genre.name) === normalizeGenreName(selected)))) return false;
  return true;
};
// Each selected genre has its own native catalog; combine their pages before
// deduplication rather than waiting through unrelated entries in the full catalog.
export const getGenreCatalogPaths = (
  options: { name: string; value: string }[], selected: string[],
): string[] => {
  const paths = options.slice(1).filter(item => selected.some(genre =>
    normalizeGenreName(genre) === normalizeGenreName(item.name))).map(item => item.value.replace('/best', ''));
  return Array.from(new Set(paths.length ? paths : [getGenreCatalogPath(options, [])]));
};

const ZONA_GENRE_SLUGS: Record<string, string> = {
  'ужасы': 'uzhasy', 'боевик': 'boevik', 'драма': 'drama', 'комедия': 'komediya',
  'триллер': 'triller', 'детектив': 'detektiv', 'мелодрама': 'melodrama',
  'фантастика': 'fantastika', 'фэнтези': 'fentezi', 'приключения': 'priklyucheniya',
  'семейный': 'semeinyi', 'военный': 'voennyi', 'исторический': 'istoriya',
  'документальный': 'dokumentalnyi', 'биография': 'biografiya', 'вестерн': 'vestern',
};
export const getZonaFilteredCatalogPaths = (paths: string[], filters: Pick<ContentFilters, 'from' | 'to' | 'genres'>): string[] => {
  const selected = filters.genres ?? [];
  const slugs = selected.map(genre => ZONA_GENRE_SLUGS[normalizeGenreName(genre)]);
  // Unknown genre aliases retain local filtering; narrowing to only recognized
  // genres would omit the unrecognized alternatives.
  const nativeGenres = selected.length && slugs.every(Boolean) ? Array.from(new Set(slugs)) : [];
  const from = filters.from ?? (filters.to ? 1800 : undefined);
  const to = filters.to ?? (filters.from ? new Date().getFullYear() + 10 : undefined);
  // Public Zona accepts individual years since 2010 and decade buckets
  // for earlier releases. Keep exact bounds in the local metadata check.
  const nativeYear = (year: number) => year >= 2010 ? String(year) : year >= 2000 ? '2000s'
    : year >= 1940 ? Math.floor((year % 100) / 10) * 10 + 's' : 'old';
  const first = from && nativeYear(from), last = to && nativeYear(to);
  const years = first && last && to! <= new Date().getFullYear() ? ['/year-' + first + (first === last ? '' : '-to-' + last)] : [''];
  return Array.from(new Set(paths.flatMap(path => {
    const genres = /\/genre-/.test(path) ? [''] : nativeGenres.length ? nativeGenres : [''];
    return genres.flatMap(genre => years.map(year =>
      path + (path.includes('/filter/') ? '' : '/filter')
      + (genre ? '/genre-' + genre : '') + year)).map(url => url.replace(/\/filter$/, ''));
  })));
};
