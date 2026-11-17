import { SavedTime, SavedTimestamp, SavedTimeVoice } from 'Component/Player/Player.type';
import type { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { EpisodePosition, episodePosition } from './episodeSelection';

function getLatestTimestamp(
  voice: SavedTimeVoice | null
): SavedTimestamp | null {
  if (!voice) return null;

  return Object.values(voice.timestamps ?? {}).reduce<SavedTimestamp | null>(
    (latest, timestamp) => {
      if (!timestamp) return latest;

      if (!latest) return timestamp;

      return (timestamp.updatedAt ?? 0) >= (latest.updatedAt ?? 0)
        ? timestamp
        : latest;
    },
    null
  );
}

export function getLastSavedEpisode(
  voice: SavedTimeVoice | null
): EpisodePosition {
  if (!voice) {
    return {};
  }

  if (voice.lastSeasonId && voice.lastEpisodeId) {
    return {
      seasonId: voice.lastSeasonId,
      episodeId: voice.lastEpisodeId,
      ...(voice.seasonNumber !== undefined ? { seasonNumber: voice.seasonNumber } : {}),
      ...(voice.episodeNumber !== undefined ? { episodeNumber: voice.episodeNumber } : {}),
    };
  }

  let latestKey: string | undefined;
  let latestTimestamp: SavedTimestamp | null = null;

  for (const [key, timestamp] of Object.entries(voice.timestamps ?? {})) {
    if (key === '0' || !timestamp) {
      continue;
    }

    if (
      !latestTimestamp
      || (timestamp.updatedAt ?? 0) >= (latestTimestamp.updatedAt ?? 0)
    ) {
      latestKey = key;
      latestTimestamp = timestamp;
    }
  }

  if (!latestKey) {
    return {};
  }

  const separatorIndex = latestKey.indexOf('-');

  if (separatorIndex <= 0 || separatorIndex >= latestKey.length - 1) {
    return {};
  }

  return {
    seasonId: latestKey.slice(0, separatorIndex),
    episodeId: latestKey.slice(separatorIndex + 1),
  };
}

export function combineSavedTimeData(
  data1: SavedTimestamp | null,
  data2: SavedTimestamp | null
): SavedTimestamp | null {
  if (!data1 && !data2) return null;
  if (!data1) return data2;
  if (!data2) return data1;

  return (data2.updatedAt ?? 0) >= (data1.updatedAt ?? 0)
    ? data2
    : data1;
}

export function combineSavedTimeVoice(
  voice1: SavedTimeVoice | null,
  voice2: SavedTimeVoice | null
): SavedTimeVoice | null {
  if (!voice1 && !voice2) return null;
  if (!voice1) return voice2;
  if (!voice2) return voice1;

  const combinedData: Record<string, SavedTimestamp | null> = {
    ...voice1.timestamps,
  };

  for (const [episodeKey, data2] of Object.entries(voice2.timestamps)) {
    combinedData[episodeKey] = combineSavedTimeData(
      combinedData[episodeKey] ?? null,
      data2
    );
  }

  const latestVoice1 = getLatestTimestamp(voice1);
  const latestVoice2 = getLatestTimestamp(voice2);

  const sourceVoice =
    !latestVoice1 && !latestVoice2
      ? voice2
      : !latestVoice1
        ? voice2
        : !latestVoice2
          ? voice1
          : (latestVoice2.updatedAt ?? 0) >= (latestVoice1.updatedAt ?? 0)
            ? voice2
            : voice1;

  const combinedVoice: SavedTimeVoice = {
    ...(sourceVoice.seasonNumber !== undefined ? { seasonNumber: sourceVoice.seasonNumber } : {}),
    ...(sourceVoice.episodeNumber !== undefined ? { episodeNumber: sourceVoice.episodeNumber } : {}),
    timestamps: combinedData,
  };

  if (sourceVoice.lastSeasonId !== undefined) {
    combinedVoice.lastSeasonId = sourceVoice.lastSeasonId;
  }

  if (sourceVoice.lastEpisodeId !== undefined) {
    combinedVoice.lastEpisodeId = sourceVoice.lastEpisodeId;
  }

  const recoveredEpisode = getLastSavedEpisode(combinedVoice);

  if (recoveredEpisode.seasonId !== undefined) {
    combinedVoice.lastSeasonId = recoveredEpisode.seasonId;
  }

  if (recoveredEpisode.episodeId !== undefined) {
    combinedVoice.lastEpisodeId = recoveredEpisode.episodeId;
  }

  return combinedVoice;
}

export function combineSavedTime(
  savedTime1: SavedTime | null,
  savedTime2: SavedTime | null
): SavedTime | null {
  if (!savedTime1 && !savedTime2) return null;
  if (!savedTime1) return savedTime2;
  if (!savedTime2) return savedTime1;

  const combinedVoices: Record<string, SavedTimeVoice | null> = {
    ...savedTime1.voices,
  };

  for (const [voiceId, voice2] of Object.entries(savedTime2.voices)) {
    combinedVoices[voiceId] = combineSavedTimeVoice(
      combinedVoices[voiceId] ?? null,
      voice2
    );
  }

  const voiceIds = new Set([
    ...Object.keys(savedTime1.voices),
    ...Object.keys(savedTime2.voices),
  ]);

  let latestVoiceId: string | null = null;
  let latestUpdatedAt = -1;

  for (const voiceId of voiceIds) {
    const latestTimestamp = getLatestTimestamp(combinedVoices[voiceId] ?? null);

    if (
      latestTimestamp &&
      (latestTimestamp.updatedAt ?? 0) >= latestUpdatedAt
    ) {
      latestVoiceId = voiceId;
      latestUpdatedAt = latestTimestamp.updatedAt ?? 0;
    }
  }

  return {
    filmId: savedTime1.filmId,
    voices: combinedVoices,
    lastVoiceId:
      latestVoiceId ?? savedTime2.lastVoiceId ?? savedTime1.lastVoiceId,
  };
}
/** Merge persisted progress across a preferred source change without rewriting its storage. */
export function getSavedTimeForFilm(
  film: { id: string; libraryId?: string }, read: (id: string) => SavedTime | null
): SavedTime | null {
  const ids = [...new Set([film.id, film.libraryId].filter((id): id is string => Boolean(id)))];
  const result = ids.reduce<SavedTime | null>((combined, id) => combineSavedTime(combined, read(id)), null);

  return result ? { ...result, filmId: film.id } : null;
}
export function withSavedEpisodePosition(previous: SavedTimeVoice, voice: FilmVoiceInterface): SavedTimeVoice {
  if (!voice.lastSeasonId || !voice.lastEpisodeId) return previous;
  const position = voice.seasons?.length ? episodePosition(voice, voice.lastSeasonId, voice.lastEpisodeId) : {};
  const sameSeason = previous.lastSeasonId === voice.lastSeasonId;
  const sameEpisode = sameSeason && previous.lastEpisodeId === voice.lastEpisodeId;

  return { ...previous, lastSeasonId: voice.lastSeasonId, lastEpisodeId: voice.lastEpisodeId,
    seasonNumber: position.seasonNumber ?? (sameSeason ? previous.seasonNumber : undefined),
    episodeNumber: position.episodeNumber ?? (sameEpisode ? previous.episodeNumber : undefined) };
}
