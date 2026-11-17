import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useSyncExternalStore } from 'react';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import type { BookmarkInterface } from 'Type/Bookmark.interface';
import type { FilmCardInterface } from 'Type/FilmCard.interface';
import type { LocalBookmarksBlob } from 'Type/LocalLibrary.interface';
import { cachedRemoteBookmarks } from 'Util/LocalLibrary/remoteBookmarks';
import { useLocalBookmarks } from './useLocalLibrary';

const empty: LocalBookmarksBlob = { categories: [], films: {} };
const snapshots = new WeakMap<object, { refs: unknown[]; blob: LocalBookmarksBlob }>();
const relevant = (key: readonly unknown[]) => key[0] === 'bookmarks' || (key[0] === 'films' && key[1] === 'bookmarks');

/** Reuse downloaded bookmark folders; a badge never requests film details or another page. */
export const useBookmarkLibrary = (): LocalBookmarksBlob => {
  const local = useLocalBookmarks();
  const { isLocalLibrary } = useConfigContext();
  const { isSignedIn } = useServiceContext();
  const client = useQueryClient();
  const cache = client.getQueryCache();
  const subscribe = useCallback((notify: () => void) => isLocalLibrary || !isSignedIn
    ? () => {}
    : cache.subscribe(event => { if (relevant(event.query.queryKey)) notify(); }), [cache, isLocalLibrary, isSignedIn]);
  const getSnapshot = useCallback(() => {
    if (isLocalLibrary || !isSignedIn) return empty;
    const metadata = client.getQueryData<BookmarkInterface[]>(['bookmarks']);
    const queries = cache.findAll({ queryKey: ['films', 'bookmarks'] });
    const refs = [metadata, ...queries.flatMap(query => [query.queryHash, query.state.data])];
    const old = snapshots.get(cache);
    if (old && refs.length === old.refs.length && refs.every((value, index) => value === old.refs[index])) return old.blob;
    const pages = queries.flatMap(query => {
      const data = query.state.data as { films?: FilmCardInterface[] } | undefined;
      return typeof query.queryKey[2] === 'string' && Array.isArray(data?.films)
        ? [{ categoryId: query.queryKey[2], films: data.films }] : [];
    });
    const blob = cachedRemoteBookmarks(metadata ?? [], pages);
    snapshots.set(cache, { refs, blob }); return blob;
  }, [cache, client, isLocalLibrary, isSignedIn]);
  const remote = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return isLocalLibrary ? local : remote;
};
