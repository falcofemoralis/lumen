import {
  CloudEntityMeta,
  CloudRecord,
  CloudSyncState,
  CloudTombstone,
} from './types';

const compareMeta = (
  a: CloudEntityMeta,
  b: CloudEntityMeta
): number => {
  if (a.updatedAt !== b.updatedAt) {
    return a.updatedAt - b.updatedAt;
  }

  if (a.deviceId === b.deviceId) {
    return 0;
  }

  return a.deviceId < b.deviceId ? -1 : 1;
};

const isMeta = (value: unknown): value is CloudEntityMeta => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as CloudEntityMeta;

  return (
    typeof candidate.updatedAt === 'number' &&
    typeof candidate.deviceId === 'string'
  );
};

const mergeRecord = <T>(
  local: CloudRecord<T> | CloudTombstone | undefined,
  remote: CloudRecord<T> | CloudTombstone | undefined
): CloudRecord<T> | CloudTombstone | undefined => {
  if (!local) {
    return remote;
  }

  if (!remote) {
    return local;
  }

  if (!isMeta(local.meta) || !isMeta(remote.meta)) {
    return local;
  }

  return compareMeta(local.meta, remote.meta) >= 0 ? local : remote;
};

const mergeMap = <T>(
  local: Record<string, CloudRecord<T> | CloudTombstone>,
  remote: Record<string, CloudRecord<T> | CloudTombstone>
): Record<string, CloudRecord<T> | CloudTombstone> => {
  const result: Record<
    string,
    CloudRecord<T> | CloudTombstone
  > = { ...local };

  for (const [id, remoteValue] of Object.entries(remote)) {
    const merged = mergeRecord(result[id], remoteValue);

    if (merged) {
      result[id] = merged;
    }
  }

  return result;
};

export const mergeCloudSyncState = (
  local: CloudSyncState,
  remote: CloudSyncState
): CloudSyncState => {
  const localUpdated = local.updatedAt ?? 0;
  const remoteUpdated = remote.updatedAt ?? 0;

  const settingsValues = { ...local.settings.values };
  const settingsMetadata = { ...local.settings.metadata };

  for (const [key, remoteMeta] of Object.entries(remote.settings.metadata)) {
    const localMeta = settingsMetadata[key];

    if (!localMeta || compareMeta(localMeta, remoteMeta) < 0) {
      settingsMetadata[key] = remoteMeta;

      if (remoteMeta.deleted) {
        delete settingsValues[key];
      } else {
        settingsValues[key] = remote.settings.values[key];
      }
    }
  }

  return {
    schemaVersion: Math.max(local.schemaVersion, remote.schemaVersion),
    revision: Math.max(local.revision, remote.revision),
    updatedAt: Math.max(localUpdated, remoteUpdated),
    deviceId:
      localUpdated > remoteUpdated
        ? local.deviceId
        : remoteUpdated > localUpdated
          ? remote.deviceId
          : local.deviceId < remote.deviceId
            ? remote.deviceId
            : local.deviceId,

    bookmarks: {
      categories: mergeMap(
        local.bookmarks.categories,
        remote.bookmarks.categories
      ),
      memberships: mergeMap(
        local.bookmarks.memberships,
        remote.bookmarks.memberships
      ),
    },

    cardCache: mergeMap(local.cardCache ?? {}, remote.cardCache ?? {}),
    history: mergeMap(local.history, remote.history),
    playerTime: mergeMap(local.playerTime, remote.playerTime),
    scheduleMarks: mergeMap(local.scheduleMarks, remote.scheduleMarks),
    comments: mergeMap(local.comments, remote.comments),

    settings: {
      values: settingsValues,
      metadata: settingsMetadata,
    },
  };
};

export const stripTombstones = <T>(
  records: Record<string, CloudRecord<T> | CloudTombstone>
): Record<string, CloudRecord<T>> => {
  const result: Record<string, CloudRecord<T>> = {};

  for (const [id, record] of Object.entries(records)) {
    if (!record.meta.deleted) {
      result[id] = record as CloudRecord<T>;
    }
  }

  return result;
};
