import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmType } from 'Type/FilmType.type';

import { mergeZonaCards } from './ZonaDesktopCatalog';
import { getZonaCatalogFilms } from './ZonaSourceAdapter';

export const ZONA_SHOWS_CATALOGS = ['realnoe-tv', 'tok-shou', 'igra', 'novosti'].flatMap(genre => (
  ['tvseries', 'movies'].map(kind => `https://w1.zona.im/${kind}/filter/genre-${genre}`)
));

/** Only website catalogs with uploaded media; the desktop torrent catalog is deliberately excluded. */
export const createZonaShowsCatalog = (load = getZonaCatalogFilms) => {
  const lastPages = new Map<string, number>();
  let displayed: FilmCardInterface[] = [];

  return async (page: number): Promise<FilmListInterface> => {
    if (page === 1) { displayed = []; lastPages.clear(); }
    const results = await Promise.allSettled(ZONA_SHOWS_CATALOGS.map(async link => {
      if (page > (lastPages.get(link) ?? Infinity)) return { films: [], totalPages: page };
      const result = await load(link, page, { deferMetadata: true, onlyAvailable: true });
      lastPages.set(link, result.totalPages);

      return result;
    }));
    const healthy = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
    if (!healthy.length) throw (results[0] as PromiseRejectedResult).reason;
    const cards = healthy.flatMap(result => result.films).filter(card => !card.isPendingRelease).map(card => ({
      ...card, type: FilmType.TV_SHOW, contentTypePending: false,
    }));
    const merged = mergeZonaCards(displayed, cards);
    const films = merged.slice(displayed.length);
    displayed = merged;

    return { films, totalPages: Math.max(page, ...healthy.map(result => result.totalPages)) };
  };
};
// Share pagination with the cached query when the screen is remounted.
export const getZonaShows = createZonaShowsCatalog();
