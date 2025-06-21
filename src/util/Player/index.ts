import t from 'i18n/t';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ProfileInterface } from 'Type/Profile.interface';
import { playerStorage } from 'Util/Storage';

export const PLAYER_SAVE_TIME_STORAGE_KEY = 'playerTime';
export const PLAYER_QUALITY_STORAGE_KEY = 'playerQuality';

const formatPlayerKeyTime = (film: FilmInterface, voice: FilmVoiceInterface) => {
  const { id: filmId } = film;
  const { id: voiceId, lastEpisodeId, lastSeasonId } = voice;

  return `${PLAYER_SAVE_TIME_STORAGE_KEY}-${filmId}-${voiceId}-${lastSeasonId}-${lastEpisodeId}`;
};

export const updatePlayerTime = (film: FilmInterface, voice: FilmVoiceInterface, time: number) => {
  playerStorage.set(
    formatPlayerKeyTime(film, voice),
    Number(time)
  );
};

export const getPlayerTime = (film: FilmInterface, voice: FilmVoiceInterface) => {
  const time = playerStorage.getNumber(formatPlayerKeyTime(film, voice));

  if (!time) {
    return 0;
  }

  return time;
};

export const updatePlayerQuality = (quality: string) => {
  playerStorage.set(
    PLAYER_QUALITY_STORAGE_KEY,
    quality
  );
};

export const getPlayerQuality = () => playerStorage.getString(PLAYER_QUALITY_STORAGE_KEY);

export const getPlayerStream = (video: FilmVideoInterface) => {
  const { streams } = video;

  const defaultQuality = getPlayerQuality();

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

export const formatFirestoreKey = (
  film: FilmInterface,
  voice: FilmVoiceInterface,
  profile: ProfileInterface
) => {
  const { id: filmId } = film;
  const { id: voiceId, lastEpisodeId, lastSeasonId } = voice;
  const { id: userId } = profile;

  return `${userId}-${filmId}-${voiceId}-${lastSeasonId}-${lastEpisodeId}`;
};
