import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import {
  LocalBookmarksBlob,
  LocalCategoryInterface,
  LocalHistoryItemInterface,
  LocalScheduleMarks,
} from 'Type/LocalLibrary.interface';
import { NotificationInterface } from 'Type/Notification.interface';
import { uuid } from 'Util/Download';
import { filmToFilmCard } from 'Util/Film';
import { episodePosition } from 'Util/Player/episodeSelection';
import { storage } from 'Util/Storage';
import { mutateCloudSync, mutateCloudSyncBatch } from 'Util/CloudSync';

import {
  addCategory,
  CategoryTitleError,
  emptyBookmarksBlob,
  filterUpdatesForLocalLibrary,
  parseBookmarksBlob,
  parseHistoryList,
  parseScheduleMarks,
  removeCategory,
  removeHistoryItem,
  reorderCategories,
  setHistoryWatched,
  setScheduleMark,
  toggleBookmark,
  upsertHistoryItem,
  validateNewCategoryTitle,
} from './logic';

export type { CategoryTitleError } from './logic';
export {
  filterUpdatesForLocalLibrary,
  bookmarksForFilm as getLocalBookmarksForFilm,
  filmsForCategory as getLocalFilmsForCategory,
  MAX_LOCAL_HISTORY_ITEMS,
  normalizeFilmLink,
  parseBookmarksBlob,
  parseHistoryList,
} from './logic';

export const LOCAL_BOOKMARKS_KEY = 'localBookmarks';
export const LOCAL_HISTORY_KEY = 'localHistory';
export const LOCAL_SCHEDULE_MARKS_KEY = 'localScheduleMarks';

const getLocalLibraryStorage = () => storage.getLocalLibraryStorage();

const getBookmarkMembershipId = (
  categoryId: string,
  filmId: string,
): string => `${categoryId}:${filmId}`;

const syncBookmarkCategory = (
  category: LocalCategoryInterface,
  position: number,
): void => {
  mutateCloudSync({
    entity: 'bookmark-category',
    id: category.id,
    value: {
      id: category.id,
      title: category.title,
      createdAt: category.createdAt,
      position,
    },
  });
};

const syncBookmarkMembership = (
  category: LocalCategoryInterface,
  filmId: string,
  filmCard: FilmCardInterface,
): void => {
  const position = category.filmIds.indexOf(filmId);

  if (position < 0) {
    mutateCloudSync({
      entity: 'bookmark-membership',
      id: getBookmarkMembershipId(category.id, filmId),
      deleted: true,
    });
    return;
  }

  mutateCloudSync({
    entity: 'bookmark-membership',
    id: getBookmarkMembershipId(category.id, filmId),
    value: {
      categoryId: category.id,
      filmId,
      position,
      film: filmCard,
    },
  });
};

const syncBookmarkMembershipDeletion = (
  categoryId: string,
  filmId: string,
): void => {
  mutateCloudSync({
    entity: 'bookmark-membership',
    id: getBookmarkMembershipId(categoryId, filmId),
    deleted: true,
  });
};

export const getLocalBookmarks = (): LocalBookmarksBlob => (
  parseBookmarksBlob(getLocalLibraryStorage().loadString(LOCAL_BOOKMARKS_KEY))
);

const saveLocalBookmarks = (blob: LocalBookmarksBlob) => {
  getLocalLibraryStorage().save(LOCAL_BOOKMARKS_KEY, blob);
};

const createCategoryObject = (blob: LocalBookmarksBlob, title: string): LocalCategoryInterface => {
  let id = uuid();

  while (blob.categories.some((category) => category.id === id)) {
    id = uuid();
  }

  return {
    id,
    title: title.trim(),
    filmIds: [],
    createdAt: Date.now(),
  };
};

/**
 * Seeds the default category the first time local mode is enabled.
 * Does nothing once the blob exists, so a user deleting all categories is respected.
 */
export const ensureDefaultLocalCategory = (title: string) => {
  if (getLocalLibraryStorage().loadString(LOCAL_BOOKMARKS_KEY) !== null) {
    return;
  }

  const blob = emptyBookmarksBlob();
  const category = createCategoryObject(blob, title);

  saveLocalBookmarks(addCategory(blob, category));
  syncBookmarkCategory(category, blob.categories.length);
};

/**
 * Creates a category with the given title.
 *
 * @returns null on success, or the reason the title was rejected.
 */
export const createLocalCategory = (title: string): CategoryTitleError | null => {
  const blob = getLocalBookmarks();
  const error = validateNewCategoryTitle(blob, title);

  if (error) {
    return error;
  }

  const category = createCategoryObject(blob, title);

  saveLocalBookmarks(addCategory(blob, category));
  syncBookmarkCategory(category, blob.categories.length);

  return null;
};

export const deleteLocalCategory = (categoryId: string) => {
  const blob = getLocalBookmarks();
  const category = blob.categories.find((item) => item.id === categoryId);

  if (!category) {
    return;
  }

  saveLocalBookmarks(removeCategory(blob, categoryId));

  mutateCloudSync({
    entity: 'bookmark-category',
    id: categoryId,
    deleted: true,
  });

  category.filmIds.forEach((filmId) => {
    syncBookmarkMembershipDeletion(categoryId, filmId);
  });
};

export const reorderLocalCategories = (
  fromIndex: number,
  toIndex: number,
): void => {
  const blob = getLocalBookmarks();

  if (
    fromIndex < 0
    || fromIndex >= blob.categories.length
    || toIndex < 0
    || toIndex >= blob.categories.length
    || fromIndex === toIndex
  ) {
    return;
  }

  const updatedBlob = reorderCategories(blob, fromIndex, toIndex);

  if (updatedBlob === blob) {
    return;
  }

  saveLocalBookmarks(updatedBlob);

  mutateCloudSyncBatch(
    updatedBlob.categories.map((category) => ({
      entity: 'bookmark-category' as const,
      id: category.id,
      value: {
        id: category.id,
        title: category.title,
        createdAt: category.createdAt,
        position: updatedBlob.categories.indexOf(category),
      },
    })),
  );
};
export const toggleLocalBookmark = (
  filmCard: FilmCardInterface,
  categoryId: string,
  isBookmarked: boolean
) => {
  const blob = getLocalBookmarks();
  const category = blob.categories.find((item) => item.id === categoryId);

  if (!category) {
    return;
  }

  const updatedBlob = toggleBookmark(
    blob,
    filmCard,
    categoryId,
    isBookmarked,
  );

  saveLocalBookmarks(updatedBlob);

  const updatedCategory = updatedBlob.categories.find(
    (item) => item.id === categoryId,
  );

  if (!updatedCategory) {
    return;
  }

  const deletedIds = category.filmIds.filter(id => !updatedCategory.filmIds.includes(id));
  mutateCloudSyncBatch([
    ...deletedIds.map(filmId => ({
      entity: 'bookmark-membership' as const,
      id: getBookmarkMembershipId(categoryId, filmId),
      deleted: true,
    })),
    ...updatedCategory.filmIds.flatMap((filmId, position) => {
      const film = updatedBlob.films[filmId];
      return film ? [{
        entity: 'bookmark-membership' as const,
        id: getBookmarkMembershipId(categoryId, filmId),
        value: { categoryId, filmId, position, film },
      }] : [];
    }),
  ]);
};

export const getLocalHistory = (): LocalHistoryItemInterface[] => (
  parseHistoryList(getLocalLibraryStorage().loadString(LOCAL_HISTORY_KEY))
);

/**
 * Series updates reduced to films tracked locally (bookmarked or in the watch history).
 */
export const getLocalSeriesUpdates = (updates: NotificationInterface[]): NotificationInterface[] => (
  filterUpdatesForLocalLibrary(updates, getLocalBookmarks(), getLocalHistory())
);

const saveLocalHistory = (items: LocalHistoryItemInterface[]) => {
  getLocalLibraryStorage().save(LOCAL_HISTORY_KEY, items);
};

/**
 * Records the film at the top of the local history. Mirrors the moments the account
 * receives saveWatch: playback start and episode/voice change.
 */
export const upsertLocalHistoryItem = (film: FilmInterface, voice: FilmVoiceInterface) => {
  const item: LocalHistoryItemInterface = {
    filmCard: filmToFilmCard(film),
    id: film.id,
    link: film.link,
    poster: film.poster,
    title: film.title,
    voiceId: voice.id,
    voiceTitle: voice.title,
    ...episodePosition(voice, voice.lastSeasonId, voice.lastEpisodeId),
    updatedAt: Date.now(),
    isWatched: false,
  };

  const history = getLocalHistory();
  const updated = upsertHistoryItem(history, item);
  saveLocalHistory(updated);

  const merged = updated.find(entry => entry.id === item.id) ?? item;
  mutateCloudSyncBatch([
    ...(merged.historyIds ?? []).filter(id => id !== merged.id).map(id => ({
      entity: 'history' as const, id, deleted: true,
    })),
    { entity: 'history', id: merged.id, value: merged },
  ]);
};

export const removeLocalHistoryItem = (filmId: string) => {
  const history = getLocalHistory();
  const existing = history.find(item => item.id === filmId);
  saveLocalHistory(removeHistoryItem(history, filmId));
  mutateCloudSyncBatch([...new Set([filmId, ...(existing?.historyIds ?? [])])].map(id => ({
    entity: 'history', id, deleted: true,
  })));
};

export const setLocalHistoryWatched = (filmId: string, isWatched: boolean) => {
  const history = getLocalHistory();
  const existing = history.find((item) => item.id === filmId);

  if (!existing) {
    return;
  }

  const updatedItem: LocalHistoryItemInterface = {
    ...existing,
    isWatched,
    updatedAt: Date.now(),
  };

  saveLocalHistory(setHistoryWatched(history, filmId, isWatched));

  mutateCloudSync({
    entity: 'history',
    id: filmId,
    value: updatedItem,
  });
};

const getAllLocalScheduleMarks = (): LocalScheduleMarks => (
  parseScheduleMarks(getLocalLibraryStorage().loadString(LOCAL_SCHEDULE_MARKS_KEY))
);

export const setLocalScheduleMark = (
  filmId: string,
  scheduleItemId: string,
  isWatched: boolean
) => {
  getLocalLibraryStorage().save(
    LOCAL_SCHEDULE_MARKS_KEY,
    setScheduleMark(
      getAllLocalScheduleMarks(),
      filmId,
      scheduleItemId,
      isWatched,
    )
  );

  mutateCloudSync({
    entity: 'schedule-mark',
    id: `${filmId}:${scheduleItemId}`,
    value: {
      filmId,
      scheduleItemId,
      isWatched,
    },
  });
};

/**
 * Overlays locally stored watched-marks onto a freshly loaded film's schedule.
 */
export const applyLocalScheduleMarks = (film: FilmInterface) => {
  const filmMarks = getAllLocalScheduleMarks()[film.id];

  if (!filmMarks || !film.schedule) {
    return;
  }

  film.schedule.forEach((schedule) => {
    schedule.items.forEach((item) => {
      if (item.id in filmMarks) {
        item.isWatched = filmMarks[item.id];
      }
    });
  });
};

export const getLocalScheduleMarks = (): LocalScheduleMarks => (
  storage.getLocalLibraryStorage().load<LocalScheduleMarks>(LOCAL_SCHEDULE_MARKS_KEY) ?? {}
);
/**
 * Replaces the complete local bookmarks state during Cloud Sync restore.
 * Intentionally does not emit Cloud Sync mutations.
 */
export const replaceLocalBookmarks = (blob: LocalBookmarksBlob): void => {
  storage.getLocalLibraryStorage().save(LOCAL_BOOKMARKS_KEY, blob);
};

/**
 * Replaces the complete local history state during Cloud Sync restore.
 * Intentionally does not emit Cloud Sync mutations.
 */
export const replaceLocalHistory = (
  items: LocalHistoryItemInterface[],
): void => {
  storage.getLocalLibraryStorage().save(LOCAL_HISTORY_KEY, items);
};

/**
 * Replaces the complete local schedule marks during Cloud Sync restore.
 * Intentionally does not emit Cloud Sync mutations.
 */
export const replaceLocalScheduleMarks = (
  marks: LocalScheduleMarks,
): void => {
  storage.getLocalLibraryStorage().save(LOCAL_SCHEDULE_MARKS_KEY, marks);
};