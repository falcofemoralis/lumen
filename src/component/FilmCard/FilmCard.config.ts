import { TxKeyPath } from 'i18n/index';
import { FilmType } from 'Type/FilmType.type';

export const TYPE_LABELS: Record<FilmType, TxKeyPath> = {
  [FilmType.FILM]: 'Movie',
  [FilmType.SERIES]: 'Serial',
  [FilmType.CARTOON]: 'Cartoon',
  [FilmType.ANIME]: 'Anime',
  [FilmType.TV_SHOW]: 'TV Show',
};

export const FILM_TYPE_COLORS = {
  [FilmType.FILM]: '#00a0b0',
  [FilmType.CARTOON]: '#216d2b',
  [FilmType.SERIES]: '#df565a',
  [FilmType.ANIME]: '#696969',
  [FilmType.TV_SHOW]: '##909215',
};

// The `Ban` mark a hidden card shows in place of its poster.
export const HIDDEN_ICON_SIZE = 40;
export const HIDDEN_ICON_SIZE_TV = 32;

// Keep in sync with the `poster` style (width / aspectRatio)
export const POSTER_WIDTH_RATIO = 0.3;
export const POSTER_ASPECT_WIDTH = 166;
export const POSTER_ASPECT_HEIGHT = 250;
