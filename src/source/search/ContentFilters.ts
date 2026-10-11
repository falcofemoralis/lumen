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
  const year = Number(film.releaseDate?.match(/\b(18|19|20)\d{2}\b/)?.[0]);
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