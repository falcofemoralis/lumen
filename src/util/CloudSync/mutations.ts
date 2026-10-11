import {
  CloudSyncMutation,
  CloudSyncState,
  CloudRecord,
  CloudTombstone,
} from './types';

import {
  createEmptyCloudSyncState,
  getCloudSyncDeviceId,
  loadCloudSyncState,
  saveCloudSyncState,
} from './storage';

import { emitCloudSyncEvent } from './events';

const compareMetadata = (
  incoming: {
    updatedAt: number;
    deviceId: string;
  },
  existing?: {
    updatedAt: number;
    deviceId: string;
  },
): number => {
  if (!existing) {
    return 1;
  }

  if (incoming.updatedAt !== existing.updatedAt) {
    return incoming.updatedAt > existing.updatedAt ? 1 : -1;
  }

  if (incoming.deviceId === existing.deviceId) {
    return 0;
  }

  return incoming.deviceId < existing.deviceId ? -1 : 1;
};

const getMutationMap = (
  state: CloudSyncState,
  entity: Exclude<CloudSyncMutation['entity'], 'setting'>,
): Record<string, CloudRecord<unknown> | CloudTombstone> => {
  switch (entity) {
    case 'bookmark-category':
      return state.bookmarks.categories;

    case 'bookmark-membership':
      return state.bookmarks.memberships;

    case 'card-cache':
      return state.cardCache ??= {};
    case 'history':
      return state.history;

    case 'player-time':
      return state.playerTime;

    case 'schedule-mark':
      return state.scheduleMarks;

    case 'comment':
      return state.comments;

    default:
      throw new Error(`Unsupported CloudSync entity: ${entity}`);
  }
};

const applyRecord = (
  target: Record<string, CloudRecord<unknown> | CloudTombstone>,
  id: string,
  mutation: CloudSyncMutation,
  updatedAt: number,
  deviceId: string,
): boolean => {
  const existing = target[id];

  if (
    existing &&
    compareMetadata(
      { updatedAt, deviceId },
      existing.meta,
    ) <= 0
  ) {
    return false;
  }

  if (mutation.deleted) {
    target[id] = {
      meta: {
        updatedAt,
        deviceId,
        deleted: true,
      },
    };
  } else {
    target[id] = {
      value: mutation.value,
      meta: {
        updatedAt,
        deviceId,
      },
    };
  }

  return true;
};

const applyMutationToState = (
  state: CloudSyncState,
  mutation: CloudSyncMutation,
): boolean => {
  const updatedAt = mutation.updatedAt ?? Date.now();
  const deviceId = mutation.deviceId ?? getCloudSyncDeviceId();

  if (mutation.entity === 'setting') {
    const existingMetadata = state.settings.metadata[mutation.id];

    if (
      !existingMetadata ||
      compareMetadata(
        { updatedAt, deviceId },
        existingMetadata,
      ) > 0
    ) {
      state.settings.metadata[mutation.id] = {
        updatedAt,
        deviceId,
        ...(mutation.deleted ? { deleted: true } : {}),
      };

      if (mutation.deleted) {
        delete state.settings.values[mutation.id];
      } else {
        state.settings.values[mutation.id] = mutation.value;
      }

      state.updatedAt = Math.max(state.updatedAt, updatedAt);
      state.deviceId = deviceId;

      return true;
    }

    return false;
  }

  const changed = applyRecord(
    getMutationMap(state, mutation.entity),
    mutation.id,
    mutation,
    updatedAt,
    deviceId,
  );

  if (changed) {
    state.updatedAt = Math.max(state.updatedAt, updatedAt);
    state.deviceId = deviceId;
  }

  return changed;
};

export const mutateCloudSyncBatch = (
  mutations: CloudSyncMutation[],
): CloudSyncMutation[] => {
  if (mutations.length === 0) {
    return [];
  }

  const state = loadCloudSyncState() ?? createEmptyCloudSyncState();

  const normalizedMutations = mutations.map((mutation) => ({
    ...mutation,
    updatedAt: mutation.updatedAt ?? Date.now(),
    deviceId: mutation.deviceId ?? getCloudSyncDeviceId(),
  }));

  const changedMutations: CloudSyncMutation[] = [];

  for (const mutation of normalizedMutations) {
    if (applyMutationToState(state, mutation)) {
      changedMutations.push(mutation);
    }
  }

  if (changedMutations.length === 0) {
    return normalizedMutations;
  }

  if (state.cardCache && Object.keys(state.cardCache).length > 6100) {
    const keys = Object.keys(state.cardCache).sort((a, b) => state.cardCache![b].meta.updatedAt - state.cardCache![a].meta.updatedAt);
    keys.slice(6100).forEach(key => delete state.cardCache![key]);
  }
  state.revision += changedMutations.length;
  saveCloudSyncState(state);

  for (const mutation of changedMutations) {
    emitCloudSyncEvent({
      type: 'mutation',
      mutation,
    });
  }

  return normalizedMutations;
};

export const mutateCloudSync = (
  mutation: CloudSyncMutation,
): CloudSyncMutation => {
  return mutateCloudSyncBatch([mutation])[0];
};
