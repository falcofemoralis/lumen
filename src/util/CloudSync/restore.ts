import { restoreCloudCardCache } from './cardCache';
import { DeviceConfigType } from 'src/config';
import { getCloudSyncSettingFromId } from 'src/config/cloudSync';
import { getGlobalConfig } from 'Context/ConfigContext';
import { applyCloudConfig } from 'Context/ConfigContext';
import { replaceLocalComments } from 'Util/LocalComments';
import {
  replaceLocalBookmarks,
  replaceLocalHistory,
  replaceLocalScheduleMarks,
} from 'Util/LocalLibrary';
import { replaceAllSavedTimes } from 'Util/Player';
import { storage } from 'Util/Storage';
import {
  CloudRecord,
  CloudSyncState,
} from './types';

import {
  SavedTime,
  SavedTimeVoice,
  SavedTimestamp,
} from 'Component/Player/Player.type';

import {
  LocalBookmarksBlob,
  LocalCategoryInterface,
  LocalHistoryItemInterface,
  LocalScheduleMarks,
} from 'Type/LocalLibrary.interface';

import { LocalCommentInterface } from 'Type/LocalComment.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
type CloudValueRecord = CloudRecord<unknown>;

const isValueRecord = (
  record: CloudValueRecord | { meta: { deleted: true } },
): record is CloudValueRecord => (
  !record.meta.deleted && 'value' in record
);

const getRecordValue = <T>(record: CloudValueRecord): T => (
  record.value as T
);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object'
);

const restoreBookmarks = (state: CloudSyncState): void => {
  const categories: LocalCategoryInterface[] = [];
  const films: Record<string, FilmCardInterface> = {};

  for (const record of Object.values(state.bookmarks.categories)) {
    if (!isValueRecord(record)) {
      continue;
    }

    const value = getRecordValue<Partial<LocalCategoryInterface> & {
      position?: unknown;
    }>(record);

    if (
      typeof value.id !== 'string'
      || typeof value.title !== 'string'
      || typeof value.createdAt !== 'number'
    ) {
      continue;
    }

    categories.push({
      id: value.id,
      title: value.title,
      createdAt: value.createdAt,
      filmIds: [],
    });

    if (typeof value.position === 'number') {
      (
        categories[categories.length - 1] as LocalCategoryInterface & {
          position?: number;
        }
      ).position = value.position;
    }
  }

  const hasCategoryPositions = categories.some(
    (category) => typeof (category as LocalCategoryInterface & {
      position?: number;
    }).position === 'number',
  );

  if (hasCategoryPositions) {
    categories.sort((a, b) => {
      const positionA = (a as LocalCategoryInterface & {
        position?: number;
      }).position;
      const positionB = (b as LocalCategoryInterface & {
        position?: number;
      }).position;

      if (typeof positionA !== 'number') {
        return 1;
      }

      if (typeof positionB !== 'number') {
        return -1;
      }

      return positionA - positionB;
    });

    categories.forEach((category) => {
      delete (category as LocalCategoryInterface & {
        position?: number;
      }).position;
    });
  }

  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );

  const membershipsByCategory = new Map<
    string,
    Array<{
      filmId: string;
      position: number;
      film: FilmCardInterface;
    }>
  >();

  for (const record of Object.values(state.bookmarks.memberships)) {
    if (!isValueRecord(record)) {
      continue;
    }

    const value = getRecordValue<{
      categoryId?: unknown;
      filmId?: unknown;
      position?: unknown;
      film?: unknown;
    }>(record);

    if (
      typeof value.categoryId !== 'string'
      || typeof value.filmId !== 'string'
      || typeof value.position !== 'number'
      || !isRecord(value.film)
    ) {
      continue;
    }

    const category = categoriesById.get(value.categoryId);

    if (!category) {
      continue;
    }

    const film = value.film as unknown as FilmCardInterface;

    if (!films[value.filmId]) {
      films[value.filmId] = film;
    }

    const memberships = membershipsByCategory.get(value.categoryId) ?? [];

    memberships.push({
      filmId: value.filmId,
      position: value.position,
      film,
    });

    membershipsByCategory.set(value.categoryId, memberships);
  }

  for (const category of categories) {
    const memberships = membershipsByCategory.get(category.id) ?? [];

    memberships.sort((a, b) => a.position - b.position);

    category.filmIds = memberships.map(({ filmId }) => filmId);
  }

  replaceLocalBookmarks({
    categories,
    films,
  } satisfies LocalBookmarksBlob);
};

const restoreHistory = (state: CloudSyncState): void => {
  const items: LocalHistoryItemInterface[] = [];

  for (const record of Object.values(state.history)) {
    if (!isValueRecord(record)) {
      continue;
    }

    const value = getRecordValue<LocalHistoryItemInterface>(record);

    if (
      !value
      || typeof value.id !== 'string'
      || typeof value.updatedAt !== 'number'
    ) {
      continue;
    }

    items.push(value);
  }

  items.sort((a, b) => b.updatedAt - a.updatedAt);

  replaceLocalHistory(items.slice(0, 200));
};

const restoreScheduleMarks = (state: CloudSyncState): void => {
  const marks: LocalScheduleMarks = {};

  for (const record of Object.values(state.scheduleMarks)) {
    if (!isValueRecord(record)) {
      continue;
    }

    const value = getRecordValue<{
      filmId?: unknown;
      scheduleItemId?: unknown;
      isWatched?: unknown;
    }>(record);

    if (
      typeof value.filmId !== 'string'
      || typeof value.scheduleItemId !== 'string'
      || typeof value.isWatched !== 'boolean'
    ) {
      continue;
    }

    if (!marks[value.filmId]) {
      marks[value.filmId] = {};
    }

    marks[value.filmId][value.scheduleItemId] = value.isWatched;
  }

  replaceLocalScheduleMarks(marks);
};

const restoreComments = (state: CloudSyncState): void => {
  const comments: LocalCommentInterface[] = [];

  for (const record of Object.values(state.comments)) {
    if (!isValueRecord(record)) {
      continue;
    }

    const value = getRecordValue<LocalCommentInterface>(record);

    if (
      !value
      || typeof value.id !== 'string'
      || typeof value.filmId !== 'string'
      || typeof value.text !== 'string'
      || typeof value.createdAt !== 'number'
    ) {
      continue;
    }

    comments.push(value);
  }

  comments.sort((a, b) => b.createdAt - a.createdAt);

  replaceLocalComments(comments);
};

const restorePlayerTime = (state: CloudSyncState): void => {
  const savedTimes = new Map<string, SavedTime>();

  for (const [id, record] of Object.entries(state.playerTime)) {
    if (!isValueRecord(record)) {
      continue;
    }

    const value = getRecordValue<SavedTimestamp>(record);

    if (
      !value
      || typeof value.time !== 'number'
      || typeof value.progress !== 'number'
    ) {
      continue;
    }

    const parts = id.split(':');

    if (parts.length < 3) {
      continue;
    }

    const filmId = parts[0];
    const voiceId = parts[1];
    const timestampKey = parts.slice(2).join(':');

    if (!filmId || !voiceId || !timestampKey) {
      continue;
    }

    let savedTime = savedTimes.get(filmId);

    if (!savedTime) {
      savedTime = {
        filmId,
        voices: {},
        lastVoiceId: null,
      };

      savedTimes.set(filmId, savedTime);
    }

    let voice = savedTime.voices[voiceId];

    if (!voice) {
      voice = {
        timestamps: {},
      } satisfies SavedTimeVoice;

      savedTime.voices[voiceId] = voice;
    }

    const existing = voice.timestamps[timestampKey];

    if (
      !existing
      || (value.updatedAt ?? 0) >= (existing.updatedAt ?? 0)
    ) {
      voice.timestamps[timestampKey] = value;
    }
  }

  for (const savedTime of savedTimes.values()) {
    let latestVoiceId: string | null = null;
    let latestUpdatedAt = -1;

    for (const [voiceId, voice] of Object.entries(savedTime.voices)) {
      if (!voice) {
        continue;
      }

      for (const timestamp of Object.values(voice.timestamps)) {
        if (
          timestamp
          && (timestamp.updatedAt ?? 0) >= latestUpdatedAt
        ) {
          latestUpdatedAt = timestamp.updatedAt ?? 0;
          latestVoiceId = voiceId;
        }
      }
    }

    savedTime.lastVoiceId = latestVoiceId;
  }

  replaceAllSavedTimes([...savedTimes.values()]);
};

const restoreSettings = (state: CloudSyncState): void => {
  const isTV = Boolean(getGlobalConfig().isTV);
  const currentPlatform = isTV ? 'atv' : 'mobile';

  const hasNewShowRatingsSetting =
    Object.prototype.hasOwnProperty.call(state.settings.metadata, 'showRatings')
    || Object.prototype.hasOwnProperty.call(state.settings.values, 'showRatings');

  for (const [id, metadata] of Object.entries(state.settings.metadata)) {
    // Migrate the old poster-rating setting without bringing the legacy
    // ratingSource key back into the new Cloud Sync schema.
    if (id === 'ratingSource') {
      if (hasNewShowRatingsSetting) {
        continue;
      }

      if (metadata.deleted) {
        applyCloudConfig('showRatings', false);
        continue;
      }

      if (!(id in state.settings.values)) {
        continue;
      }

      const value = state.settings.values[id];

      if (value === 'imdb' || value === 'kinopoisk') {
        applyCloudConfig('showRatings', true);
      } else if (value === 'off') {
        applyCloudConfig('showRatings', false);
      }

      continue;
    }

    const parsed = getCloudSyncSettingFromId(id);

    if (!parsed) {
      continue;
    }

    const { key, scope, legacy } = parsed;

    // isTV is a property of the physical installation and must never
    // come from Cloud Sync.
    if (scope === 'local') {
      continue;
    }

    // Platform-specific settings from the new format are restored only
    // on the matching platform.
    if (scope === 'mobile' || scope === 'atv') {
      if (scope !== currentPlatform) {
        continue;
      }
    }

    // Old records used plain IDs. A platform-specific setting stored
    // under such an ID must not leak between mobile and ATV installations.
    if (legacy) {
      continue;
    }

    if (metadata.deleted) {
      applyCloudConfig(
        key,
        undefined,
      );
      continue;
    }

    if (!(id in state.settings.values)) {
      continue;
    }

    applyCloudConfig(
      key,
      state.settings.values[id],
    );
  }
};
export const restoreCloudSyncState = (
  state: CloudSyncState,
): void => {
  restoreBookmarks(state);
  restoreHistory(state);
  restorePlayerTime(state);
  restoreScheduleMarks(state);
  restoreComments(state);
  restoreSettings(state);
  restoreCloudCardCache(state);
};
