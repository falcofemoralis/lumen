import { reactNativeDownloads } from 'Modules/react-native-downloads';
import { DownloadFileInterface, DownloadFilmInterface } from 'Type/DownloadFile.interface';
import { storage } from 'Util/Storage';

const TASK_IDS_KEY = 'taskIds';

/** Mirrors the downloader library's own DEFAULT_MAX_PARALLEL_DOWNLOADS. */
export const DEFAULT_MAX_PARALLEL_DOWNLOADS = 4;

export const MAX_PARALLEL_DOWNLOADS_OPTIONS = [1, 2, 3, 4, 6, 8];

export const uuid = () => Math.random().toString(36).substring(2, 6);

export const getDownloadsDir = (customPath?: string): string => {
  const storagePath = customPath ?? reactNativeDownloads.getDefaultDownloadDirectory();

  return `${storagePath}`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 0) return 'Unknown';
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export const formatDestination = (uri: string): string => {
  const path = uri.replace('file://', '');
  try {
    return decodeURIComponent(path);
  } catch (e) {
    console.warn('Failed to decode URI component:', e);

    return path;
  }
};

export const TaskIdStorage = {
  load: (): Record<string, DownloadFileInterface> => {
    try {
      const json = storage.getDownloadsStorage().loadString(TASK_IDS_KEY);

      return json ? JSON.parse(json) : {};
    } catch (e) {
      console.warn('Failed to load persisted task IDs:', e);

      return {};
    }
  },

  save: (mapping: Record<string, DownloadFileInterface>) => {
    storage.getDownloadsStorage().save(TASK_IDS_KEY, mapping);
  },

  getOrCreate: (destination: string, data: Omit<DownloadFileInterface, 'id'>): string => {
    const mapping = TaskIdStorage.load();

    if (mapping[destination]) return mapping[destination].id;

    const newId = uuid();
    mapping[destination] = {
      id: newId,
      ...data,
    };

    TaskIdStorage.save(mapping);

    return newId;
  },

  clear: (url: string) => {
    const mapping = TaskIdStorage.load();
    delete mapping[url];
    TaskIdStorage.save(mapping);
  },

  clearAll: () => {
    storage.getDownloadsStorage().remove(TASK_IDS_KEY);
  },
};

// A file that is still downloading is deliberately left out of the grouped
// film's voices (see `groupDownloadedFiles`), so a film that has no stream
// anywhere has nothing playable on disk yet.
export const hasDownloadedVideo = ({ film }: DownloadFilmInterface): boolean => (film.voices ?? []).some(
  (voice) => (voice.video?.streams.length ?? 0) > 0
    || (voice.seasons ?? []).some(
      (season) => season.episodes.some((episode) => (episode.video?.streams.length ?? 0) > 0)
    )
);

/**
 * Extension of the file a url points at, without its query string.
 * Urls whose last path segment carries no extension (`.../poster`) would
 * otherwise yield the whole `host/path` tail and turn the destination into a
 * nested path, so anything that does not look like an extension falls back.
 */
export const getUrlExtension = (url: string, fallback: string): string => {
  const path = url.split(/[?#]/)[0];
  const fileName = path.split('/').pop() ?? '';

  if (!fileName.includes('.')) {
    return fallback;
  }

  const extension = fileName.split('.').pop() ?? '';

  return (/^[a-zA-Z0-9]{1,5}$/).test(extension) ? extension : fallback;
};

export const normalizeName = (name: string) => {
  return name.replaceAll(/[\\\/:*?"<>|]/g, '').replaceAll(' ', '-').trim();
};