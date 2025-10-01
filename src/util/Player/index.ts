import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { FirestoreDocument, SavedTime, SavedTimestamp, SavedTimeVoice } from 'Component/Player/Player.type';
import * as Device from 'expo-device';
import { VideoTrack } from 'expo-video';
import t from 'i18n/t';
import ConfigStore from 'Store/Config.store';
import LoggerStore from 'Store/Logger.store';
import StorageStore from 'Store/Storage.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { getFormattedDate } from 'Util/Date';
import { safeJsonParse } from 'Util/Json';

export const PLAYER_SAVED_TIME_STORAGE_KEY = 'playerTime';
export const PLAYER_QUALITY_STORAGE_KEY = 'playerQuality';

const formatPlayerKeyTime = (film: FilmInterface) => {
  const { id: filmId } = film;

  return `${PLAYER_SAVED_TIME_STORAGE_KEY}-${filmId}`;
};

const formatFirestoreKey = (
  film: FilmInterface,
  profile: ProfileInterface
) => {
  const { id: userId } = profile;

  return `${formatPlayerKeyTime(film)}-${userId}`;
};

const formatTimestampKey = (
  voice: FilmVoiceInterface
) => {
  if (!voice.lastSeasonId || !voice.lastEpisodeId) {
    return '0';
  }

  return `${voice.lastSeasonId}-${voice.lastEpisodeId}`;
};

const prepareSavedTimeObject = (
  film: FilmInterface,
  voice: FilmVoiceInterface,
  time: number,
  progress: number,
  previousSavedTime?: SavedTime | null
): SavedTime => {
  const newSavedTime: SavedTime = previousSavedTime
    ? { ...previousSavedTime }
    : { filmId: film.id, voices: {} };

  const voiceData = newSavedTime.voices[voice.id] ?? {} as SavedTimeVoice;

  if (!voiceData.timestamps) {
    voiceData.timestamps = {};
  }

  voiceData.timestamps[formatTimestampKey(voice)] = {
    time,
    progress,
    deviceId: ConfigStore.getDeviceId(),
  };

  newSavedTime.voices[voice.id] = voiceData;

  return newSavedTime;
};

export const updateSavedTime = (film: FilmInterface, voice: FilmVoiceInterface, time: number, progress: number) => {
  const key = formatPlayerKeyTime(film);

  const prevSavedTimeJson = StorageStore.getPlayerStorage().getString(key);
  const prevSavedTime = safeJsonParse<SavedTime | null>(prevSavedTimeJson, null);
  const newSavedTime = prepareSavedTimeObject(film, voice, time, progress, prevSavedTime);

  StorageStore.getPlayerStorage().set(
    key,
    JSON.stringify(newSavedTime)
  );
};

export const setSavedTime = (savedTime: SavedTime, film: FilmInterface) => {
  const key = formatPlayerKeyTime(film);

  StorageStore.getPlayerStorage().set(
    key,
    JSON.stringify(savedTime)
  );
};

export const getSavedTime = (film: FilmInterface): SavedTime | null => {
  const key = formatPlayerKeyTime(film);
  const savedTimeJson = StorageStore.getPlayerStorage().getString(key);

  if (!savedTimeJson) {
    return null;
  }

  const savedTime = safeJsonParse<SavedTime | null>(savedTimeJson, null);

  return savedTime;
};

export const getVideoTime = (voice: FilmVoiceInterface, savedTime: SavedTime | null) => {
  if (!savedTime) {
    return 0;
  }

  const voiceData = savedTime.voices[voice.id];

  if (!voiceData || !voiceData.timestamps) {
    return 0;
  }

  return voiceData.timestamps[formatTimestampKey(voice)]?.time ?? 0;
};

export const getVideoProgress = (voice: FilmVoiceInterface, timestamp: SavedTime | null) => {
  if (!timestamp) {
    return 0;
  }

  const voiceData = timestamp.voices[voice.id];

  if (!voiceData || !voiceData.timestamps) {
    return 0;
  }

  return voiceData.timestamps[formatTimestampKey(voice)]?.progress ?? 0;
};

export const updateFirestoreSavedTime = async (
  film: FilmInterface,
  voice: FilmVoiceInterface,
  profile: ProfileInterface,
  firestoreDb: FirebaseFirestoreTypes.CollectionReference<FirestoreDocument>,
  time: number,
  progress: number
) => {
  const key = formatFirestoreKey(film, profile);

  const doc = await firestoreDb.doc(key) .get();
  const data = doc.data();

  const prevSavedTime = safeJsonParse<SavedTime | null>(data?.savedTime, null);
  const newSavedTime = prepareSavedTimeObject(film, voice, time, progress, prevSavedTime);

  firestoreDb
    .doc(key)
    .set({
      savedTime: JSON.stringify(newSavedTime),
      updatedAt: getFormattedDate(),
    });
};

export const getFirestoreSavedTime = async (
  film: FilmInterface,
  profile: ProfileInterface,
  firestoreDb: FirebaseFirestoreTypes.CollectionReference<FirestoreDocument>
) => {
  const key = formatFirestoreKey(film, profile);
  const doc = await firestoreDb.doc(key).get();
  const data = doc.data();

  if (!data) {
    return null;
  }

  const timestamp = safeJsonParse<SavedTime | null>(data?.savedTime, null);

  return timestamp;
};

export const getFirestoreVideoTime = (
  voice: FilmVoiceInterface,
  firestoreSavedTime: SavedTime | null,
  savedTime: SavedTime | null
) => {
  if (!firestoreSavedTime && !savedTime) {
    return null;
  }

  if (!savedTime) {
    return getVideoTime(voice, firestoreSavedTime);
  }

  if (!firestoreSavedTime) {
    return getVideoTime(voice, savedTime);
  }

  const voiceData = savedTime.voices[voice.id];
  const firestoreVoiceData = firestoreSavedTime.voices[voice.id];

  if (!voiceData && !firestoreVoiceData) {
    return null;
  }

  if (!voiceData) {
    return firestoreVoiceData?.timestamps[formatTimestampKey(voice)]?.time ?? 0;
  }

  if (!firestoreVoiceData) {
    return voiceData?.timestamps[formatTimestampKey(voice)]?.time ?? 0;
  }

  const data = voiceData?.timestamps[formatTimestampKey(voice)] ?? {} as SavedTimestamp;
  const firestoreData = firestoreVoiceData?.timestamps[formatTimestampKey(voice)] ?? {} as SavedTimestamp;

  return firestoreData.deviceId !== data.deviceId
    ? firestoreData.time
    : data.time;
};

export const updatePlayerQuality = (quality: string) => {
  LoggerStore.debug('updatePlayerQuality', { quality });

  StorageStore.getPlayerStorage().set(
    PLAYER_QUALITY_STORAGE_KEY,
    quality
  );
};

export const getPlayerQuality = () => StorageStore.getPlayerStorage().getString(PLAYER_QUALITY_STORAGE_KEY);

export const getPlayerStream = (video: FilmVideoInterface) => {
  const { streams } = video;

  const defaultQuality = getPlayerQuality();

  LoggerStore.debug('getPlayerStream', { defaultQuality, streams });

  if (!defaultQuality) {
    if (streams.length >= 3) {
      return streams[2]; // 720p
    }

    if (streams.length === 2) {
      return streams[1]; // 480p
    }

    if (streams.length === 1) {
      return streams[0]; // 360p
    }
  }

  const stream = streams.find((s) => s.quality === defaultQuality);

  if (!stream) {
    // maximum available quality
    return streams[streams.length - 1];
  }

  return stream;
};

export const prepareShareBody = (film: FilmInterface) => {
  const { title, link } = film;

  return t('Watch %s:\n %s', title, link);
};

export const formatVideoTrackInfo = (videoTrack: VideoTrack|null) => {
  if (!videoTrack) {
    return '-';
  }

  const {
    // size: { height = 0, width = 0 } = {},
    mimeType: quality,
    // frameRate,
    // bitrate,
  } = videoTrack;

  const info = [];

  if (quality) {
    info.push(quality);
  }

  // if (frameRate) {
  //   info.push(`${frameRate}`);
  // }

  // if (mimeType) {
  //   info.push(getCodecName(mimeType));
  // }

  // if (bitrate) {
  //   info.push(`${bitrate / 1000}kbps`);
  // }

  return info.join('/');
};

export const getBufferTime = (quality: string) => {
  const { totalMemory } = Device;

  // less then 2GB
  if (
    totalMemory && totalMemory <= (2.5 * 1024 * 1024 * 1024)
    && (quality === '4K' || quality === '2K' || quality === '1080p Ultra')
  ) {
    return 30;
  }

  // less then 4GB
  if (totalMemory && totalMemory <= (4.5 * 1024 * 1024 * 1024)
    && (quality === '4K' || quality === '2K')
  ) {
    return 30;
  }

  // less then 6GB
  if (totalMemory && totalMemory <= (6.5 * 1024 * 1024 * 1024)
    && (quality === '4K')
  ) {
    return 30;
  }

  return 180;
};