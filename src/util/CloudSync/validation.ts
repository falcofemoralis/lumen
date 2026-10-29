import {
  CLOUD_SYNC_SCHEMA_VERSION,
  CloudSyncEnvelope,
  CloudSyncState,
  CloudEntityMeta,
  CloudRecord,
  CloudTombstone,
} from './types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isMeta = (value: unknown): value is CloudEntityMeta => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.updatedAt === 'number' &&
    Number.isFinite(value.updatedAt) &&
    typeof value.deviceId === 'string' &&
    value.deviceId.length > 0 &&
    (value.deleted === undefined || typeof value.deleted === 'boolean')
  );
};

const isRecordEntry = (
  value: unknown,
): value is CloudRecord<unknown> | CloudTombstone => {
  if (!isObject(value) || !isMeta(value.meta)) {
    return false;
  }

  if (value.meta.deleted === true) {
    return true;
  }

  return Object.prototype.hasOwnProperty.call(value, 'value');
};

const isRecordMap = (value: unknown): boolean => {
  if (!isObject(value)) {
    return false;
  }

  return Object.values(value).every(isRecordEntry);
};

const isSettingsState = (value: unknown): boolean => {
  if (!isObject(value)) {
    return false;
  }

  return (
    isObject(value.values) &&
    isObject(value.metadata) &&
    Object.values(value.metadata).every(isMeta)
  );
};

const isCommonState = (value: unknown): boolean => {
  if (!isObject(value)) {
    return false;
  }

  return (
    value.schemaVersion === CLOUD_SYNC_SCHEMA_VERSION &&
    typeof value.revision === 'number' &&
    Number.isFinite(value.revision) &&
    typeof value.updatedAt === 'number' &&
    Number.isFinite(value.updatedAt) &&
    typeof value.deviceId === 'string' &&
    value.deviceId.length > 0
  );
};

export const isValidCloudSyncState = (
  value: unknown,
): value is CloudSyncState => {
  if (!isCommonState(value)) {
    return false;
  }

  const state = value as CloudSyncState;

  return (
    isObject(state.bookmarks) &&
    isRecordMap(state.bookmarks.categories) &&
    isRecordMap(state.bookmarks.memberships) &&
    isRecordMap(state.history) &&
    isRecordMap(state.playerTime) &&
    isRecordMap(state.scheduleMarks) &&
    isRecordMap(state.comments) &&
    (state.cardCache === undefined || isRecordMap(state.cardCache)) &&
    isSettingsState(state.settings)
  );
};

export const isValidCloudSyncEnvelope = (
  value: unknown,
): value is CloudSyncEnvelope => {
  if (!isObject(value) || value.type !== 'sync') {
    return false;
  }

  return isValidCloudSyncState(value.payload);
};
