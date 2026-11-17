import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmType } from 'Type/FilmType.type';

import { mergeZonaCards, requestZonaDesktopFilms, zonaDesktopOptions } from './ZonaDesktopCatalog';
import { getZonaCatalogFilms } from './ZonaSourceAdapter';

export const ZONA_SHOWS_CATALOGS = ['realnoe-tv', 'tok-shou', 'igra', 'novosti'].flatMap(genre => (
  ['tvseries', 'movies'].map(kind => `https://w1.zona.im/${kind}/filter/genre-${genre}`)
));

/** Website media remains available independently of the optional torrent catalog. */
export const createZonaShowsCatalog = (load = getZonaCatalogFilms) => {
  const lastPages = new Map<string, number>();
  let displayed: FilmCardInterface[] = [];

  return async (page: number): Promise<FilmListInterface> => {
    if (page === 1) { displayed = []; lastPages.clear(); }
    const native = zonaDesktopOptions().torrents && page <= (lastPages.get('desktop') ?? Infinity)
      ? Promise.allSettled([requestZonaDesktopFilms('tor_count:[1 TO *] AND genreId:(25 OR 26 OR 27 OR 28)', page)])
      : null;
    const results = await Promise.allSettled(ZONA_SHOWS_CATALOGS.map(async link => {
      if (page > (lastPages.get(link) ?? Infinity)) return { films: [], totalPages: page };
      const result = await load(link, page, { deferMetadata: true, onlyAvailable: true });
      lastPages.set(link, result.totalPages);

      return result;
    }));
    if (native) {
      const extra = await native;
      if (extra[0].status === 'fulfilled') lastPages.set('desktop', extra[0].value.totalPages);
      results.push(...extra);
    }
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
const catalogs = new Map<string, ReturnType<typeof createZonaShowsCatalog>>();
export const getZonaShows = (page: number) => {
  const options = zonaDesktopOptions();
  const key = `${Boolean(options.torrents)}:${options.adult}`;
  let catalog = catalogs.get(key);
  if (!catalog) { catalog = createZonaShowsCatalog(); catalogs.set(key, catalog); }
  return catalog(page);
};
