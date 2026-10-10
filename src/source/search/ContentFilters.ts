import { FilmInterface } from 'Type/Film.interface';
import { FilmType } from 'Type/FilmType.type';

export interface ContentFilters {
  from?: number;
  to?: number;
  includedCountries: string[];
  excludedCountries: string[];
  type?: FilmType;
  genre?: string;
}
export const normalizeFilterValue = (value: string) => value.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').trim();
export const matchesContentFilters = (film: FilmInterface, filters: ContentFilters): boolean => {
  const year = Number(film.releaseDate?.match(/\b(18|19|20)\d{2}\b/)?.[0]);
  if (filters.from && (!year || year < filters.from)) return false;
  if (filters.to && (!year || year > filters.to)) return false;
  if (filters.type && film.type !== filters.type) return false;
  const countries = (film.countries ?? []).map((item) => normalizeFilterValue(item.name));
  if (filters.excludedCountries.some((country) => countries.includes(normalizeFilterValue(country)))) return false;
  if (filters.includedCountries.length && !filters.includedCountries.some((country) => countries.includes(normalizeFilterValue(country)))) return false;
  if (filters.genre && !(film.genres ?? []).some((genre) => normalizeFilterValue(genre.name) === normalizeFilterValue(filters.genre!))) return false;
  return true;
};