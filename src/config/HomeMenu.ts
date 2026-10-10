import { MenuItemInterface } from 'Type/MenuItem.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';

export const getHomeMenu = (serviceMenu: MenuItemInterface[]): MenuItemInterface[] => [
  { id: 'zona-movies', title: 'Фильмы', path: 'https://w1.zona.im/movies' },
  { id: 'zona-series', title: 'Сериалы', path: 'https://w1.zona.im/tvseries' },
  { id: 'zona-cartoons', title: 'Мультфильмы', path: 'https://w1.zona.im/movies/filter/genre-multfilm' },
  { id: 'zona-anime', title: 'Аниме', path: 'https://w1.zona.im/movies/filter/genre-anime' },
  ...serviceMenu,
];

export const arrangeHomeMenu = (items: MenuItemInterface[], order: string[], hidden: string[]): MenuItemInterface[] => {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = [...new Set([...order, ...items.map((item) => item.id)])]
    .flatMap((id) => byId.has(id) ? [byId.get(id)!] : []);
  const visible = ordered.filter((item) => !hidden.includes(item.id));
  return visible.length ? visible : ordered.slice(0, 1);
};
/** Zona catalogs include animation; filter after metadata enrichment. */
export const matchesHomeTab = (tabId: string, card: Pick<FilmCardInterface, 'type' | 'contentTypePending'>): boolean => {
  const types: Record<string, FilmType> = {
    'zona-movies': FilmType.FILM,
    'zona-series': FilmType.SERIES,
    'zona-cartoons': FilmType.CARTOON,
    'zona-anime': FilmType.ANIME,
  };
  const expected = types[tabId];
  return !expected || (!card.contentTypePending && card.type === expected);
};