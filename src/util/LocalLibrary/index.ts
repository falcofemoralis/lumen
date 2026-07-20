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
import { storage } from 'Util/Storage';

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

  saveLocalBookmarks(addCategory(blob, createCategoryObject(blob, title)));
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

  saveLocalBookmarks(addCategory(blob, createCategoryObject(blob, title)));

  return null;
};

export const deleteLocalCategory = (categoryId: string) => {
  saveLocalBookmarks(removeCategory(getLocalBookmarks(), categoryId));
};

export const toggleLocalBookmark = (
  filmCard: FilmCardInterface,
  categoryId: string,
  isBookmarked: boolean
) => {
  saveLocalBookmarks(toggleBookmark(getLocalBookmarks(), filmCard, categoryId, isBookmarked));
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
  saveLocalHistory(upsertHistoryItem(getLocalHistory(), {
    id: film.id,
    link: film.link,
    poster: film.poster,
    title: film.title,
    voiceTitle: voice.title,
    seasonId: voice.lastSeasonId,
    episodeId: voice.lastEpisodeId,
    updatedAt: Date.now(),
    isWatched: false,
  }));
};

export const removeLocalHistoryItem = (filmId: string) => {
  saveLocalHistory(removeHistoryItem(getLocalHistory(), filmId));
};

export const setLocalHistoryWatched = (filmId: string, isWatched: boolean) => {
  saveLocalHistory(setHistoryWatched(getLocalHistory(), filmId, isWatched));
};

const getAllLocalScheduleMarks = (): LocalScheduleMarks => (
  parseScheduleMarks(getLocalLibraryStorage().loadString(LOCAL_SCHEDULE_MARKS_KEY))
);

export const setLocalScheduleMark = (filmId: string, scheduleItemId: string, isWatched: boolean) => {
  getLocalLibraryStorage().save(
    LOCAL_SCHEDULE_MARKS_KEY,
    setScheduleMark(getAllLocalScheduleMarks(), filmId, scheduleItemId, isWatched)
  );
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
