import type { FilmInterface } from 'Type/Film.interface';
import type { FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

import type { TorrentConnection } from '../../util/TorrentEngine';
import { getZonaTorrents } from '../torrent/catalog';
import { createTorrentClient } from '../torrent/client';
import type { ZonaTorrentRelease } from '../torrent/model';
import { SourcePlaybackAdapter } from './SourcePlaybackAdapter';

export const torrentVoices = (releases: ZonaTorrentRelease[], episodic: boolean): FilmVoiceInterface[] => {
  const groups = new Map<string, ZonaTorrentRelease[]>();
  for (const candidate of releases) {
    let release = candidate;
    if (!episodic && release.files.length > 1) {
      const sorted = [...release.files].sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
      // A small release bumper must not hide the substantially larger feature film.
      if (sorted.every(file => file.size) && sorted[0].size! >= sorted[1].size! * 10) {
        release = { ...release, files: [sorted[0]] };
      }
    }
    if (!episodic && release.files.length !== 1) continue;
    const key = `${release.title } • ${ release.quality}`;
    groups.set(key, [...(groups.get(key) ?? []), release]);
  }

  return [...groups].flatMap(([title, variants]) => {
    const seasons = new Map<number, Map<number, string>>();
    if (episodic) for (const release of variants) for (const file of release.files) {
      if (file.season === undefined || file.episode === undefined) continue;
      const episodes = seasons.get(file.season) ?? new Map<number, string>();
      if (!episodes.has(file.episode)) episodes.set(file.episode, file.path);
      seasons.set(file.season, episodes);
    }
    if (episodic && !seasons.size) return [];
    const normalized: SeasonInterface[] = [...seasons].sort(([a], [b]) => a - b).map(([season, episodes]) => ({
      seasonId: String(season), name: `Сезон ${ season}`,
      episodes: [...episodes.keys()].sort((a, b) => a - b).map(episode => ({
        episodeId: String(episode), name: `Серия ${ episode}`,
      })),
    }));

    return [{ id: `zona-torrent:${ encodeURIComponent(title)}`,
      identifier: `zona-torrent:${ encodeURIComponent(title)}`,
      title: `${title } (BitTorrent)`, torrentReleases: variants,
      ...(episodic ? { seasons: normalized } : {}),
      isCamrip: '0', isDirector: '0', isAds: '0', isPremium: false, isActive: false }];
  });
};
export const createZonaTorrentPlaybackAdapter = (
  online: SourcePlaybackAdapter,
  start: () => Promise<TorrentConnection>,
  enabled: () => boolean,
  load = getZonaTorrents
): SourcePlaybackAdapter => {
  const client = createTorrentClient(start);
  const guard = () => { if (!enabled()) throw new Error('Torrent playback is disabled in settings.'); };
  const video = async (film: FilmInterface, voice: FilmVoiceInterface, season?: string, episode?: string) => {
    guard();
    const releases = voice.torrentReleases ?? [];
    for (const release of releases) {
      const file = film.hasSeasons
        ? release.files.find(item => item.season === Number(season) && item.episode === Number(episode))
        : release.files.length === 1 ? release.files[0] : undefined;
      if (file) return { streams: [await client.stream(release, file.path)] };
    }
    throw new Error('The requested episode is not available in this torrent voice.');
  };

  return {
    source: online.source,
    async getFilmVoices(film) {
      if (!film.catalogOnly) {
        const voices = await online.getFilmVoices(film);
        if (voices.length || !enabled()) return voices;
      }
      guard();
      const id = film.externalIds?.kinopoisk;
      if (!id) throw new Error('Missing Kinopoisk ID for torrent catalog entry.');

      const releases = await load(id);
      if (!releases.length) throw new Error('Zona не вернула доступных публичных видеораздач для этого произведения.');
      const voices = torrentVoices(releases, film.hasSeasons);
      if (!voices.length) throw new Error('В раздачах Zona не удалось однозначно определить фильм или номера серий.');

      return voices;
    },
    async getFilmSeasons(film, voice) {
      if (!voice.torrentReleases) return online.getFilmSeasons(film, voice);
      guard();

      return voice;
    },
    getFilmStreamsByVoice: (film, voice) => voice.torrentReleases
      ? video(film, voice) : online.getFilmStreamsByVoice(film, voice),
    getFilmStreamsByEpisodeId: (film, voice, season, episode) => voice.torrentReleases
      ? video(film, voice, season, episode) : online.getFilmStreamsByEpisodeId(film, voice, season, episode),
  };
};
