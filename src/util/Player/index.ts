import { CollectionReference, doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { AUTO_QUALITY, MAX_QUALITY } from 'Component/Player/Player.config';
import {
  FirestoreDocument,
  PlayerVideoTrack,
  SavedTime,
  SavedTimestamp,
  SavedTimeVoice,
} from 'Component/Player/Player.type';
import * as Device from 'expo-device';
import { t } from 'i18n/translate';
import { VideoConfig, VideoPlayer } from 'react-native-video';
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

// react-native-video's own default, kept here so getBufferConfig can clamp it
const DEFAULT_MIN_BUFFER_MS = 5000;

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
    : { filmId: film.id, voices: {}, lastVoiceId: null };

  const voiceData = newSavedTime.voices[voice.id] ?? {} as SavedTimeVoice;

  if (!voiceData.timestamps) {
    voiceData.timestamps = {};
  }

  voiceData.lastEpisodeId = voice.lastEpisodeId;
  voiceData.lastSeasonId = voice.lastSeasonId;

  voiceData.timestamps[formatTimestampKey(voice)] = {
    time,
    progress,
    deviceId: getDeviceId(),
  };

  newSavedTime.voices[voice.id] = voiceData;
  newSavedTime.lastVoiceId = voice.id;

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
  firestoreDb: CollectionReference<FirestoreDocument>,
  time: number,
  progress: number
) => {
  const key = formatFirestoreKey(film, profile);
  const docRef = doc(firestoreDb, key);

  const snapshot = await getDoc(docRef);
  const data = snapshot.data();

  const prevSavedTime = safeJsonParse<SavedTime | null>(data?.savedTime, null);
  const newSavedTime = prepareSavedTimeObject(film, voice, time, progress, prevSavedTime);

  setDoc(docRef, {
    savedTime: JSON.stringify(newSavedTime),
    updatedAt: getFormattedDate(),
  });
};

export const getFirestoreSavedTime = async (
  film: FilmInterface,
  profile: ProfileInterface,
  firestoreDb: CollectionReference<FirestoreDocument>
) => {
  const key = formatFirestoreKey(film, profile);
  const snapshot = await getDoc(doc(firestoreDb, key));
  const data = snapshot.data();

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

export const getPlayerQuality = () => {
  return storage.getPlayerStorage().loadString(PLAYER_QUALITY_STORAGE_KEY) || '720p';
};

export const getQualityFromStreams = (video: FilmVideoInterface, quality: string) => {
  const { streams } = video;

  // if quality is auto, return auto and handle it in the player
  if (quality === AUTO_QUALITY.value) {
    return quality;
  }

  if (!streams.length) {
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

export const formatVideoTrackInfo = (videoTrack: PlayerVideoTrack|null) => {
  if (!videoTrack) {
    return '-';
  }

  const {
    quality,
    // width,
    // height,
  } = videoTrack;

  const info = [];

  if (quality) {
    info.push(quality);
  }

  // if (width && height) {
  //   info.push(`${width}x${height}`);
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

// `rate` is a plain setter with no method form, and the player is an imperative
// native handle rather than a React value - keeping the write out of the
// component body is what tells the compiler this mutation is intentional.
export const applyPlayerRate = (player: VideoPlayer, rate: number) => {
  player.rate = rate;
};

// expo-video took a single forward buffer duration in seconds. react-native-video
// configures ExoPlayer's load control in milliseconds, so the same number drives
// `maxBufferMs` on Android and `preferredForwardBufferDurationMs` on iOS. The
// minimum is kept below the maximum, otherwise ExoPlayer rejects the config.
export const getBufferConfig = (
  quality: string,
  bufferTimeSetting?: number,
  backBufferTimeSetting?: number
): NonNullable<VideoConfig['bufferConfig']> => {
  const forwardSeconds = bufferTimeSetting ?? getBufferTime(quality);
  const bufferMs = forwardSeconds * 1000;

  // ExoPlayer discards everything behind the playhead by default, so rewinding
  // even a few seconds re-downloads the segment. Keeping a back buffer makes
  // those seeks instant, at the cost of holding the media in memory - never more
  // than the forward buffer already costs, which is what the clamp is for.
  const backBufferMs = Math.min(backBufferTimeSetting ?? 0, forwardSeconds) * 1000;

  return {
    minBufferMs: Math.min(DEFAULT_MIN_BUFFER_MS, bufferMs),
    maxBufferMs: bufferMs,
    preferredForwardBufferDurationMs: bufferMs,
    backBufferDurationMs: backBufferMs,
  };
};

// react-native-video hands external subtitles to the native player, which parses
// and times them itself. Entries without a url are language slots the site lists
// but does not actually ship a file for.
export const getExternalSubtitles = (
  video: FilmVideoInterface,
  isOffline?: boolean
): VideoConfig['externalSubtitles'] => {
  const { subtitles = [] } = video;

  return subtitles
    .filter(({ url }) => Boolean(url))
    .map(({ name, url, languageCode }) => ({
      // downloaded subtitles are stored as bare paths, but a download can leave
      // an entry pointing at the original remote url, so only add the scheme
      // when there is none
      uri: isOffline && !url.includes('://') ? `file://${url}` : url,
      label: name,
      language: languageCode || 'und',
      // the urls carry query strings often enough that extension sniffing is
      // unreliable, and every subtitle this app resolves is WebVTT
      type: 'vtt' as const,
    }));
};

// what the media notification and the lock screen show while this player owns
// the media session
export const getPlayerMetadata = (
  film: FilmInterface,
  voice: FilmVoiceInterface
): VideoConfig['metadata'] => {
  const { title, poster, hasSeasons } = film;
  const { title: voiceTitle, lastSeasonId, lastEpisodeId } = voice;

  const episode = hasSeasons && lastSeasonId && lastEpisodeId
    ? t('Season {{season}} - Episode {{episode}}', {
      season: lastSeasonId,
      episode: lastEpisodeId,
    })
    : undefined;

  return {
    title,
    subtitle: episode ?? voiceTitle ?? undefined,
    artist: voiceTitle ?? undefined,
    imageUri: poster,
  };
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