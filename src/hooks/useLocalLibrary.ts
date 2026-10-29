import { useMemo } from 'react';
import { useMMKVString } from 'react-native-mmkv';
import { LocalBookmarksBlob, LocalHistoryItemInterface } from 'Type/LocalLibrary.interface';
import {
  LOCAL_BOOKMARKS_KEY,
  LOCAL_HISTORY_KEY,
  parseBookmarksBlob,
  parseHistoryList,
} from 'Util/LocalLibrary';
import { storage } from 'Util/Storage';

let cachedRaw: string | undefined;
let cachedBookmarks: LocalBookmarksBlob | undefined;
const sharedBookmarks = (raw?: string): LocalBookmarksBlob => {
  if (!cachedBookmarks || cachedRaw !== raw) {
    cachedRaw = raw;
    cachedBookmarks = parseBookmarksBlob(raw);
  }
  return cachedBookmarks;
};

/**
 * Reactive view of the local bookmark categories. Re-renders the consumer on any
 * local bookmark write, which is what keeps the mounted tab screens fresh.
 */
export const useLocalBookmarks = (): LocalBookmarksBlob => {
  const [raw] = useMMKVString(LOCAL_BOOKMARKS_KEY, storage.getLocalLibraryStorage().getMMKVInstance());

  return useMemo(() => sharedBookmarks(raw), [raw]);
};

/**
 * Reactive view of the local watch history, newest first.
 */
export const useLocalHistory = (): LocalHistoryItemInterface[] => {
  const [raw] = useMMKVString(LOCAL_HISTORY_KEY, storage.getLocalLibraryStorage().getMMKVInstance());

  return useMemo(() => parseHistoryList(raw), [raw]);
};
