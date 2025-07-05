import { SavedTime, SavedTimestamp, SavedTimeVoice } from 'Component/Player/Player.type';

export function combineSavedTimeData(
  data1: SavedTimestamp | null,
  data2: SavedTimestamp | null
): SavedTimestamp | null {
  if (!data1 && !data2) return null;
  if (!data1) return data2;
  if (!data2) return data1;

  return data1.deviceId !== data2.deviceId ? data1 : data2;
}

export function combineSavedTimeVoice(
  voice1: SavedTimeVoice | null,
  voice2: SavedTimeVoice | null
): SavedTimeVoice | null {
  if (!voice1 && !voice2) return null;
  if (!voice1) return voice2;
  if (!voice2) return voice1;

  const combinedData: Record<string, SavedTimestamp | null> = { ...voice1.timestamps };

  for (const [episodeKey, data2] of Object.entries(voice2.timestamps)) {
    const data1 = combinedData[episodeKey];
    combinedData[episodeKey] = combineSavedTimeData(data1, data2);
  }

  return { timestamps: combinedData };
}

export function combineSavedTime(
  savedTime1: SavedTime | null,
  savedTime2: SavedTime | null
): SavedTime | null {
  if (!savedTime1 && !savedTime2) return null;
  if (!savedTime1) return savedTime2;
  if (!savedTime2) return savedTime1;

  const combinedVoices: Record<string, SavedTimeVoice | null> = { ...savedTime1.voices };

  for (const [voiceId, voice2] of Object.entries(savedTime2.voices)) {
    const voice1 = combinedVoices[voiceId];
    combinedVoices[voiceId] = combineSavedTimeVoice(voice1, voice2);
  }

  return { ...savedTime1, voices: combinedVoices };
}