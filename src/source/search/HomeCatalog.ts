import { FilmListInterface } from 'Type/FilmList.interface';
import { ContentSource } from '../types/ContentSource';
import { SourceAdapter } from '../types/SourceAdapter';

export const MULTI_SOURCE_HOME_TABS = new Set(['new', 'slider', 'soon', 'watching', 'popular']);

export const homeCatalogLinks = (tab: string, source: ContentSource): string[] => {
  if (!MULTI_SOURCE_HOME_TABS.has(tab)) return [];
  if (source === ContentSource.ANIXART) return ['https://anixart-app.com/catalog?homeTab=' + tab];
  if (source !== ContentSource.ZONA) return [];
  if (tab === 'new') return ['https://w1.zona.im/updates/movies', 'https://w1.zona.im/updates/tvseries'];
  const filter = tab === 'soon' ? '/filter/sort-year'
    : tab === 'slider' ? '/filter/year-' + new Date().getFullYear() + '/sort-popularity' : '';
  return ['https://w1.zona.im/movies' + filter, 'https://w1.zona.im/tvseries' + filter];
};

/** Per-tab loader: stop exhausted catalogs and preserve healthy sources on failure. */
export const createHomeCatalogLoader = () => {
  const pages = new Map<string, number>();
  return async (tab: string, adapter: SourceAdapter, page: number, supplement?: () => Promise<FilmListInterface>, onProgress?: (result: FilmListInterface) => void): Promise<FilmListInterface> => {
    if (adapter.source === ContentSource.REZKA && supplement) {
      const key = tab + ':rezka';
      if (page === 1) pages.delete(key);
      if (page > (pages.get(key) ?? Infinity)) return { films: [], totalPages: page };
      const result = await supplement();
      pages.set(key, result.totalPages);
      return result;
    }
    const tabId = tab.split(':')[0];
    const links = homeCatalogLinks(tabId, adapter.source);
    const partials = new Map<string, FilmListInterface>();
    const publish = (link: string, result: FilmListInterface) => {
      partials.set(link, result);
      onProgress?.({ films: [...partials.values()].flatMap(value => tabId === 'soon'
        ? value.films.filter(card => card.isPendingRelease) : value.films), totalPages: 1 });
    };
    const results = await Promise.allSettled(links.map(async link => {
      if (page === 1) pages.delete(tab + ':' + link);
      if (page > (pages.get(tab + ':' + link) ?? Infinity)) return { films: [], totalPages: page };
      if (!adapter.getFilms) throw new Error('Source catalog unavailable');
      const result = await adapter.getFilms(link, page, { deferMetadata: true,
        onProgress: page === 1 ? result => publish(link, result) : undefined });
      if (page === 1) publish(link, result);
      // Zona updates pages repeat their first batch regardless of ?page.
      const totalPages = link.includes('/updates/') ? 1 : result.totalPages;
      pages.set(tab + ':' + link, totalPages);
      return { ...result, totalPages, films: tabId === 'soon' ? result.films.filter(card => card.isPendingRelease) : result.films };
    }));
    const successful = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
    if (!successful.length && results.length) throw (results[0] as PromiseRejectedResult).reason;
    return { films: successful.flatMap(result => result.films), totalPages: Math.max(page, ...successful.map(result => result.totalPages)) };
  };
};