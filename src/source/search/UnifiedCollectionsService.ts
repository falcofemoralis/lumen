import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { SourceAdapter } from '../types/SourceAdapter';
import { ContentSource } from '../types/ContentSource';
import { isSourceEnabled, enabledSourceKey } from '../types/SourceSelection';
import { withDeadline } from '../request';

type Page = { items: ContentCollectionInterface[]; totalPages: number };
export const createUnifiedCollectionsService = (adapters: SourceAdapter[]) => {
  const states = new Map<string, Map<ContentSource, number>>();
  return {
    async getCollections(page: number, onProgress?: (result: Page) => void): Promise<Page> {
      const key = enabledSourceKey();
      const totals = page === 1 ? new Map<ContentSource, number>() : states.get(key) ?? new Map<ContentSource, number>();
      states.set(key, totals);
      const sources = [ContentSource.ZONA, ContentSource.ANIXART, ContentSource.REZKA]
        .map(source => adapters.find(adapter => adapter.source === source))
        .filter((adapter): adapter is SourceAdapter => !!adapter?.getCollections && isSourceEnabled(adapter.source)
          && (totals.get(adapter.source) ?? page) >= page);
      if (!sources.length) return { items: [], totalPages: Math.max(page, ...totals.values()) };
      const results = new Map<ContentSource, Page>();
      const snapshot = (): Page => ({
        items: sources.flatMap(adapter => (results.get(adapter.source)?.items ?? []).map(item => ({
          ...item, id: adapter.source + ':' + item.id, source: adapter.name,
        }))),
        totalPages: Math.max(page, ...totals.values()),
      });
      const settled = await Promise.allSettled(sources.map(async adapter => {
        const result = await withDeadline(adapter.getCollections!(page), 12_000);
        totals.set(adapter.source, result.totalPages);
        results.set(adapter.source, result);
        onProgress?.(snapshot());
      }));
      if (!results.size) throw (settled.find(result => result.status === 'rejected') as PromiseRejectedResult).reason;
      return snapshot();
    },
  };
};
