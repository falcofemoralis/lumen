import { CONFIG_KEY_SECTIONS, DeviceConfigType, migrateLegacyConfig } from 'src/config';
import { getCloudSyncSettingId } from 'src/config/cloudSync';
import { DEVICE_CONFIG } from 'Context/ConfigContext';
import { SavedTimestamp } from 'Component/Player/Player.type';
import {
  getLocalBookmarks,
  getLocalHistory,
  getLocalScheduleMarks,
} from 'Util/LocalLibrary';
import { getLocalComments } from 'Util/LocalComments';
import { getAllSavedTimes } from 'Util/Player';
import { storage } from 'Util/Storage';

import {
  createEmptyCloudSyncState,
  getCloudSyncDeviceId,
} from './storage';
import {
  CloudRecord,
  CloudSyncState,
} from './types';

const createMeta = (
  updatedAt: number,
  deviceId = getCloudSyncDeviceId(),
) => ({
  updatedAt,
  deviceId,
});

const createRecord = (
  value: unknown,
  updatedAt: number,
  deviceId?: string,
): CloudRecord<unknown> => ({
  value,
  meta: createMeta(updatedAt, deviceId),
});

const hasOwn = (object: object, key: string): boolean => (
  Object.prototype.hasOwnProperty.call(object, key)
);

export const createLocalCloudSyncState = (): CloudSyncState => {
  const state = createEmptyCloudSyncState();
  const deviceId = getCloudSyncDeviceId();
  const bootstrapTimestamp = Date.now();

  state.revision = 1;
  state.updatedAt = bootstrapTimestamp;
  state.deviceId = deviceId;

  const bookmarks = getLocalBookmarks();

  bookmarks.categories.forEach((category) => {
    state.bookmarks.categories[category.id] = createRecord(
      {
        id: category.id,
        title: category.title,
        createdAt: category.createdAt,
      },
      category.createdAt || bootstrapTimestamp,
    );

    category.filmIds.forEach((filmId, position) => {
      const film = bookmarks.films[filmId];

      if (!film) {
        return;
      }

      state.bookmarks.memberships[
        `${category.id}:${filmId}`
      ] = createRecord(
        {
          categoryId: category.id,
          filmId,
          position,
          film,
        },
        bootstrapTimestamp,
      );
    });
  });

  getLocalHistory().forEach((item) => {
    state.history[item.id] = createRecord(
      item,
      item.updatedAt || bootstrapTimestamp,
    );
  });

  const scheduleMarks = getLocalScheduleMarks();

  Object.entries(scheduleMarks).forEach(([filmId, marks]) => {
    Object.entries(marks).forEach(([scheduleItemId, isWatched]) => {
      state.scheduleMarks[
        `${filmId}:${scheduleItemId}`
      ] = createRecord(
        {
          filmId,
          scheduleItemId,
          isWatched,
        },
        bootstrapTimestamp,
      );
    });
  });

  getLocalComments().forEach((comment) => {
    state.comments[comment.id] = createRecord(
      comment,
      comment.createdAt || bootstrapTimestamp,
    );
  });

  getAllSavedTimes().forEach((savedTime) => {
    Object.entries(savedTime.voices).forEach(([voiceId, voiceData]) => {
      if (!voiceData?.timestamps) {
        return;
      }

      Object.entries(voiceData.timestamps).forEach(
        ([timestampKey, timestamp]) => {
          if (!timestamp || timestampKey === '0') {
            return;
          }

          const savedTimestamp = timestamp as SavedTimestamp;

          state.playerTime[
            `${savedTime.filmId}:${voiceId}:${timestampKey}`
          ] = createRecord(
            savedTimestamp,
            savedTimestamp.updatedAt || bootstrapTimestamp,
            savedTimestamp.deviceId || deviceId,
          );
        },
      );
    });
  });

  const storedConfig = migrateLegacyConfig(
    storage.getConfigStorage().load<Record<string, unknown>>(DEVICE_CONFIG) ?? {}
  );

  if (storedConfig) {
    const configKeys =
      Object.keys(CONFIG_KEY_SECTIONS) as Array<keyof DeviceConfigType>;

    configKeys.forEach((key) => {
      if (!hasOwn(storedConfig, String(key))) {
        return;
      }

      const value = storedConfig[key];

      if (typeof value === 'undefined') {
        return;
      }

      const id = getCloudSyncSettingId(key);
      if (!id) return;

      state.settings.values[id] = value;
      state.settings.metadata[id] = createMeta(bootstrapTimestamp);
    });
  }

  return state;
};

export const createLocalCloudBootstrapState = (): CloudSyncState =>
  createLocalCloudSyncState();
