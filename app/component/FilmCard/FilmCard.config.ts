import { FilmType } from 'Type/FilmType.type';

export const TYPE_LABELS = {
  [FilmType.Film]: 'Movie',
  [FilmType.Series]: 'Series',
  [FilmType.Multfilm]: 'Cartoon',
  [FilmType.Anime]: 'Anime',
  [FilmType.TVShow]: 'TV Show',
};

export const FILM_TYPE_COLORS = {
  [FilmType.Film]: '#00a0b0',
  [FilmType.Multfilm]: '#216d2b',
  [FilmType.Series]: '#df565a',
  [FilmType.Anime]: '#696969',
  [FilmType.TVShow]: '##909215',
};
