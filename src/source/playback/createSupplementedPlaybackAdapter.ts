import { FilmInterface } from 'Type/Film.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { SourcePlaybackAdapter } from './SourcePlaybackAdapter';

type RezkaPlayback = Pick<SourcePlaybackAdapter,
  'getFilmSeasons' | 'getFilmStreamsByVoice' | 'getFilmStreamsByEpisodeId'>;

const voiceKey = (voice: FilmVoiceInterface) => (
  voice.title.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim()
  + ':' + voice.isCamrip + ':' + voice.isDirector
);
export const supplementVoices = (zona: FilmVoiceInterface[], rezka: FilmVoiceInterface[]) => {
  const available = new Set(zona.map(voiceKey));
  return [
    ...zona.map((voice) => ({ ...voice, title: voice.title + ' (Zona)' })),
    ...rezka.filter((voice) => !available.has(voiceKey(voice))).map((voice) => ({
      ...voice, id: 'rezka:' + voice.id, identifier: 'rezka:' + voice.identifier,
      nativeVoiceId: voice.id, playbackSource: 'REZKA' as const, isActive: false,
      title: voice.title + ' (HDRezka)',
    })),
  ];
};

export const createSupplementedPlaybackAdapter = (
  zona: SourcePlaybackAdapter, rezka: RezkaPlayback,
): SourcePlaybackAdapter => {
  const discovery = new Map<string, { time: number; value: Promise<FilmVoiceInterface[]> }>();
  const native = (film: FilmInterface, voice: FilmVoiceInterface) => {
    const sourceFilm = film.metadataSourceFilm;
    const sourceVoice = sourceFilm?.voices.find((item) => item.id === voice.nativeVoiceId);
    if (!sourceFilm || !sourceVoice) throw new Error('HDRezka voice is unavailable for this film');
    return { film: sourceFilm, voice: { ...sourceVoice, seasons: voice.seasons,
      lastSeasonId: voice.lastSeasonId, lastEpisodeId: voice.lastEpisodeId } };
  };
  return {
    source: zona.source,
    async getFilmVoices(film) {
      const key = film.link;
      const cached = discovery.get(key);
      let value = cached && Date.now() - cached.time < 60_000 ? cached.value : undefined;
      if (!value) {
        value = zona.getFilmVoices(film).catch(() => []).then((voices) => {
          if (!voices.length) discovery.delete(key);
          return voices;
        });
        discovery.set(key, { time: Date.now(), value });
      }
      const result = supplementVoices(await value, film.metadataSourceFilm?.voices ?? []);
      if (!result.length) throw new Error('No playable voices found');
      return result;
    },    async getFilmSeasons(film, voice) {
      if (voice.playbackSource !== 'REZKA') return zona.getFilmSeasons(film, voice);
      const selected = native(film, voice);
      const updated = await rezka.getFilmSeasons(selected.film, selected.voice);
      return { ...voice, seasons: updated.seasons };
    },
    async getFilmStreamsByVoice(film, voice) {
      if (voice.playbackSource !== 'REZKA') return zona.getFilmStreamsByVoice(film, voice);
      const selected = native(film, voice);
      return rezka.getFilmStreamsByVoice(selected.film, selected.voice);
    },
    async getFilmStreamsByEpisodeId(film, voice, seasonId, episodeId) {
      if (voice.playbackSource !== 'REZKA') return zona.getFilmStreamsByEpisodeId(film, voice, seasonId, episodeId);
      const selected = native(film, voice);
      return rezka.getFilmStreamsByEpisodeId(selected.film, selected.voice, seasonId, episodeId);
    },
  };
};
