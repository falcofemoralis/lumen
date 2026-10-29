import type { FilmInterface } from 'Type/Film.interface';

export const buildFilmSubtitle = (
  year?: string | number,
  countries: string[] = [],
  genres: string[] = [],
): string => {
  const seen = new Set<string>();
  return [year === undefined ? '' : String(year), ...countries, ...genres]
    .map((part) => part.trim()).filter((part) => {
      const key = part.normalize('NFKC').toLowerCase().replace(/ё/g, 'е');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join(', ');
};

export const subtitleFromFilm = (film: FilmInterface): string => buildFilmSubtitle(
  film.releaseDate,
  film.countries?.map((country) => country.name),
  film.genres?.map((genre) => genre.name),
);