import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { AUTO_QUALITY, MAX_QUALITY } from 'Component/Player/Player.config';
import { FirestoreDocument, SavedTime, SavedTimestamp, SavedTimeVoice } from 'Component/Player/Player.type';
import * as Device from 'expo-device';
import { VideoTrack } from 'expo-video';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { getFormattedDate } from 'Util/Date';
import { getDeviceId } from 'Util/DeviceId';
import { safeJsonParse } from 'Util/Json';
import { storage } from 'Util/Storage';

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
    deviceId: getDeviceId(),
  };

  newSavedTime.voices[voice.id] = voiceData;

  return newSavedTime;
};

export const updateSavedTime = (film: FilmInterface, voice: FilmVoiceInterface, time: number, progress: number) => {
  const key = formatPlayerKeyTime(film);

  const prevSavedTime = storage.getPlayerStorage().load<SavedTime | null>(key);
  const newSavedTime = prepareSavedTimeObject(film, voice, time, progress, prevSavedTime);

  storage.getPlayerStorage().save(
    key,
    newSavedTime
  );
};

export const setSavedTime = (savedTime: SavedTime, film: FilmInterface) => {
  const key = formatPlayerKeyTime(film);

  storage.getPlayerStorage().save(
    key,
    savedTime
  );
};

export const getSavedTime = (film: FilmInterface): SavedTime | null => {
  const key = formatPlayerKeyTime(film);
  const savedTime = storage.getPlayerStorage().load<SavedTime | null>(key);

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
  storage.getPlayerStorage().saveString(
    PLAYER_QUALITY_STORAGE_KEY,
    quality
  );
};

export const loadPlayerQuality = () => {
  return storage.getPlayerStorage().loadString(PLAYER_QUALITY_STORAGE_KEY) || '720p';
};

export const getPlayerQuality = (video: FilmVideoInterface, qualityArg?: string) => {
  const { streams } = video;

  const quality = qualityArg || loadPlayerQuality();

  // if quality is auto, return auto and handle it in the player
  if (quality === AUTO_QUALITY.value) {
    return quality;
  }

  // if quality is not found in the list of available qualities or this is MAX quality
  // return the max available quality (last item in the list)
  const stream = streams.find((s) => s.quality === quality);
  if (!stream || quality === MAX_QUALITY.value) {
    return streams[streams.length - 1].quality;
  }

  return quality;
};

export const getPlayerStream = (video: FilmVideoInterface, quality: string) => {
  const { streams } = video;

  const stream = streams.find((s) => s.quality === quality);
  if (!stream) {
    return { url: null, quality };
  }

  return stream;
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

export const getPlayerAvailableQualityItems = (video: FilmVideoInterface) => {
  const { streams } = video;

  const qualityItems = streams.map((s) => ({
    label: s.quality,
    value: s.quality,
  })).concat([MAX_QUALITY]);

  const isHlsSupported = streams.some((s) => s.url.endsWith('m3u8'));

  if (isHlsSupported) {
    qualityItems.push(AUTO_QUALITY);
  }

  return qualityItems.reverse();
};