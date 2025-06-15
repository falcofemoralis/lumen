import t from 'i18n/t';
import { FilmType } from 'Type/FilmType.type';

export const TYPE_LABELS = {
  [FilmType.FILM]: t('Movie'),
  [FilmType.SERIES]: t('Series'),
  [FilmType.CARTOON]: t('Cartoon'),
  [FilmType.ANIME]: t('Anime'),
  [FilmType.TV_SHOW]: t('TV Show'),
};

export const FILM_TYPE_COLORS = {
  [FilmType.FILM]: '#00a0b0',
  [FilmType.CARTOON]: '#216d2b',
  [FilmType.SERIES]: '#df565a',
  [FilmType.ANIME]: '#696969',
  [FilmType.TV_SHOW]: '##909215',
};
