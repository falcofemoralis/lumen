import { FilmInterface } from 'Type/Film.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

import {
  getZonaSeasonEpisodes,
  getZonaSeasons,
} from '../adapters/ZonaSourceAdapter';
import { ContentSource } from '../types/ContentSource';
import {
  requestZonaStreams,
  ZonaRuntimeStream,
} from './ZonaStreamBridge';
import { SourcePlaybackAdapter } from './SourcePlaybackAdapter';


const logZonaStreamVoices = (
  label: string,
  streams: ZonaRuntimeStream[],
): void => {
  const voices = Array.from(
    new Set(
      streams
        .filter((stream) => !stream.isTrailer)
        .map((stream) => ({
          translation: String(stream.translation ?? '').trim(),
          language: String(stream.language ?? '').trim(),
        }))
        .filter((item) => item.translation || item.language)
        .map((item) => JSON.stringify(item)),
    ),
  ).map((item) => JSON.parse(item) as {
    translation: string;
    language: string;
  });

  console.log(`[ZONA STREAM VOICES] ${label}`, voices);
};

const normalizeStreams = (
  streams: ZonaRuntimeStream[],
): FilmStreamInterface[] => {
  const result = new Map<string, FilmStreamInterface>();

  for (const stream of streams) {
    const url = stream.source?.url?.trim();

    if (!url || stream.isTrailer) {
      continue;
    }

    const quality = String(stream.resolution || stream.quality || '').trim();

    if (!quality) {
      continue;
    }

    if (!result.has(url)) {
      result.set(url, {
        url,
        quality,
        headers: stream.source?.headers ?? {},
      });
    }
  }

  return Array.from(result.values());
};

const normalizeSubtitles = (
  streams: ZonaRuntimeStream[],
): FilmVideoInterface['subtitles'] => {
  const result = new Map<string, NonNullable<FilmVideoInterface['subtitles']>[number]>();

  for (const stream of streams) {
    for (const subtitle of stream.subtitles ?? []) {
      const url =
        typeof subtitle.url === 'string'
          ? subtitle.url
          : typeof subtitle.href === 'string'
            ? subtitle.href
            : '';

      if (!url) {
        continue;
      }

      const languageCode =
        typeof subtitle.languageCode === 'string'
          ? subtitle.languageCode
          : typeof subtitle.language === 'string'
            ? subtitle.language
            : '';

      const name =
        typeof subtitle.name === 'string'
          ? subtitle.name
          : languageCode;

      const key = `${languageCode}:${url}`;

      if (!result.has(key)) {
        result.set(key, {
          name,
          languageCode,
          url,
          isDefault: false,
        });
      }
    }
  }

  return Array.from(result.values());
};

const getZonaKinopoiskId = (film: FilmInterface): number => {
  const value = film.externalIds?.kinopoisk;

  if (!value) {
    throw new Error('Zona film has no Kinopoisk ID');
  }

  const id = Number(value);

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Invalid Zona Kinopoisk ID: ${value}`);
  }

  return id;
};

const getEpisodeKey = (
  seasonId: string,
  episodeId: string,
): string => (
  `S${String(seasonId).padStart(2, '0')}E${String(episodeId).padStart(2, '0')}`
);

const normalizeZonaTranslation = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const input = value.trim();

  if (!input) {
    return '';
  }

  let current: unknown = input;

  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof current !== 'string') {
      break;
    }

    const text = current.trim();

    if (!text) {
      return '';
    }

    try {
      const parsed = JSON.parse(text) as unknown;

      if (typeof parsed === 'string') {
        current = parsed;
        continue;
      }

      if (Array.isArray(parsed)) {
        const first = parsed[0];

        if (first && typeof first === 'object') {
          const values = Object.values(first as Record<string, unknown>);

          if (values.length > 0) {
            current = values[0];
            continue;
          }
        }

        current = first ?? '';
        continue;
      }

      if (parsed && typeof parsed === 'object') {
        const values = Object.values(parsed as Record<string, unknown>);

        if (values.length > 0) {
          current = values[0];
          continue;
        }
      }
    } catch {
      return text;
    }

    return text;
  }

  return typeof current === 'string' ? current.trim() : '';
};

const getZonaStreamGroup = (
  stream: ZonaRuntimeStream,
): { translation: string; language: string; key: string } => {
  const translation = normalizeZonaTranslation(stream.translation);
  const language = String(stream.language ?? '').trim();
  const key = `${translation.toLocaleLowerCase()}|${language.toLocaleLowerCase()}`;

  return {
    translation,
    language,
    key,
  };
};

const getZonaVoiceIdentifier = (
  translation: string,
  language: string,
): string => {
  const key = `${translation}|${language}`.toLocaleLowerCase();

  return `zona:${encodeURIComponent(key)}`;
};

const getZonaDiscoveryStreams = async (
  film: FilmInterface,
): Promise<ZonaRuntimeStream[]> => {
  const kinopoiskId = getZonaKinopoiskId(film);

  if (!film.hasSeasons) {
    return requestZonaStreams({
      kinopoiskId,
      episodeKey: null,
    });
  }

  const seasons = await getZonaSeasons(film.link);

  for (const season of seasons) {
    const populatedSeason = await getZonaSeasonEpisodes(
      film.link,
      season.seasonId,
    );

    const firstEpisode = populatedSeason?.episodes?.[0];

    if (!firstEpisode) {
      continue;
    }

    return requestZonaStreams({
      kinopoiskId,
      episodeKey: getEpisodeKey(
        season.seasonId,
        firstEpisode.episodeId,
      ),
    });
  }

  return [];
};

const createZonaVoices = (
  streams: ZonaRuntimeStream[],
): FilmVoiceInterface[] => {
  const groups = new Map<
    string,
    { translation: string; language: string }
  >();

  for (const stream of streams) {
    if (stream.isTrailer) {
      continue;
    }

    const group = getZonaStreamGroup(stream);

    if (!group.translation && !group.language) {
      continue;
    }

    if (!groups.has(group.key)) {
      groups.set(group.key, {
        translation: group.translation,
        language: group.language,
      });
    }
  }

  return Array.from(groups.values()).map(
    ({ translation, language }, index) => ({
      id: getZonaVoiceIdentifier(translation, language),
      identifier: getZonaVoiceIdentifier(translation, language),
      title: translation || language || `Zona ${index + 1}`,
      isCamrip: '0',
      isDirector: '0',
      isAds: '0',
      isPremium: false,
      isActive: index === 0,
    }),
  );
};

const filterZonaStreamsByVoice = (
  streams: ZonaRuntimeStream[],
  voice: FilmVoiceInterface,
): ZonaRuntimeStream[] => {
  if (!voice.identifier.startsWith('zona:')) {
    return streams;
  }

  return streams.filter((stream) => {
    if (stream.isTrailer) {
      return false;
    }

    const group = getZonaStreamGroup(stream);

    return getZonaVoiceIdentifier(
      group.translation,
      group.language,
    ) === voice.identifier;
  });
};

const createZonaVoice = (
  film: FilmInterface,
  seasons?: SeasonInterface[],
): FilmVoiceInterface => ({
  id: 'zona',
  identifier: 'zona',
  title: 'Zona',
  isCamrip: '0',
  isDirector: '0',
  isAds: '0',
  isPremium: false,
  isActive: true,
  ...(seasons ? { seasons } : {}),
});

const ZonaPlaybackAdapter: SourcePlaybackAdapter = {
  source: ContentSource.ZONA,

  async getFilmVoices(
    film: FilmInterface,
  ): Promise<FilmVoiceInterface[]> {
    const streams = await getZonaDiscoveryStreams(film);

    logZonaStreamVoices('DISCOVERY', streams);

    const voices = createZonaVoices(streams);

    console.log('[ZONA VOICE DISCOVERY]', {
      link: film.link,
      hasSeasons: film.hasSeasons,
      streamCount: streams.length,
      voices: voices.map((voice) => ({
        id: voice.id,
        identifier: voice.identifier,
        title: voice.title,
        isActive: voice.isActive,
      })),
    });

    return voices;
  },

  async getFilmSeasons(
    film: FilmInterface,
    voice: FilmVoiceInterface,
  ): Promise<FilmVoiceInterface> {
    const seasons = await getZonaSeasons(film.link);


    const populatedSeasons = await Promise.all(
      seasons.map(async (season) => {
        const populatedSeason = await getZonaSeasonEpisodes(
          film.link,
          season.seasonId,
        );

        return populatedSeason ?? season;
      }),
    );


    return {
      ...voice,
      seasons: populatedSeasons,
    };
  },

  async getFilmStreamsByVoice(
    film: FilmInterface,
    voice: FilmVoiceInterface,
  ): Promise<FilmVideoInterface> {
    const streams = await requestZonaStreams({
      kinopoiskId: getZonaKinopoiskId(film),
      episodeKey: null,
    });

    const voiceStreams = filterZonaStreamsByVoice(streams, voice);

    logZonaStreamVoices('VOICE', voiceStreams);

    console.log('[ZONA PLAYBACK RAW STREAMS]', {
      link: film.link,
      voice: {
        id: voice.id,
        identifier: voice.identifier,
        title: voice.title,
      },
      count: voiceStreams.length,
      streams: voiceStreams.map((stream) => ({
        url: stream.source?.url ?? null,
        resolution: stream.resolution,
        quality: stream.quality,
        translation: stream.translation,
        language: stream.language,
        isTrailer: stream.isTrailer,
        subtitles: stream.subtitles?.length ?? 0,
      })),
    });

    const normalizedStreams = normalizeStreams(voiceStreams);
    const normalizedSubtitles = normalizeSubtitles(voiceStreams);

    console.log('[ZONA PLAYBACK NORMALIZED]', {
      link: film.link,
      voice: voice.identifier,
      streams: normalizedStreams,
      subtitles: normalizedSubtitles,
    });

    return {
      streams: normalizedStreams,
      subtitles: normalizedSubtitles,
    };
  },
  async getFilmStreamsByEpisodeId(
    film: FilmInterface,
    _voice: FilmVoiceInterface,
    seasonId: string,
    episodeId: string,
  ): Promise<FilmVideoInterface> {
    const episodeKey = getEpisodeKey(seasonId, episodeId);

    console.log('[ZONA PLAYBACK EPISODE REQUEST]', {
      link: film.link,
      kinopoiskId: getZonaKinopoiskId(film),
      seasonId,
      episodeId,
      episodeKey,
    });

    const streams = await requestZonaStreams({
      kinopoiskId: getZonaKinopoiskId(film),
      episodeKey,
    });

    logZonaStreamVoices('EPISODE', streams);

    console.log('[ZONA PLAYBACK EPISODE RAW STREAMS]', {
      link: film.link,
      seasonId,
      episodeId,
      episodeKey,
      count: streams.length,
      streams: streams.map((stream) => ({
        url: stream.source?.url ?? null,
        resolution: stream.resolution,
        quality: stream.quality,
        translation: stream.translation,
        language: stream.language,
        isTrailer: stream.isTrailer,
        subtitles: stream.subtitles?.length ?? 0,
      })),
    });

    const voiceStreams = filterZonaStreamsByVoice(streams, _voice);

    const normalizedStreams = normalizeStreams(voiceStreams);
    const normalizedSubtitles = normalizeSubtitles(voiceStreams);

    console.log('[ZONA PLAYBACK EPISODE NORMALIZED]', {
      link: film.link,
      seasonId,
      episodeId,
      episodeKey,
      voice: {
        id: _voice.id,
        identifier: _voice.identifier,
        title: _voice.title,
      },
      streams: normalizedStreams,
      subtitles: normalizedSubtitles,
    });

    return {
      streams: normalizedStreams,
      subtitles: normalizedSubtitles,
    };
  },
};

export {
  createZonaVoice,
  getEpisodeKey,
  normalizeStreams,
};

export default ZonaPlaybackAdapter;
