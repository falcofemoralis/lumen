import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ContentSource } from '../types/ContentSource';
import { SourcePlaybackAdapter } from './SourcePlaybackAdapter';
import { anixartReleaseId, requestAnixart } from '../adapters/AnixartApi';
import { withDeadline } from '../request';

const requestText = async (url: string, init?: RequestInit): Promise<string> => {
  const controller = new AbortController();
  return withDeadline((async () => {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error('Anixart player ' + new URL(url).hostname + ' ' + (init?.method ?? 'GET') + ': HTTP ' + response.status);
    return response.text();
  })(), 12_000, 'Плеер Anixart не ответил вовремя.', () => controller.abort());
};
// React Native does not guarantee a browser atob global. Stream links contain
// ASCII URLs, so decode them here without depending on the host JS runtime.
const decodeBase64 = (value: string): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const input = value.replace(/=+$/, '');
  if (input.length % 4 === 1 || /[^A-Za-z0-9+/]/.test(input)) throw new Error('Invalid base64 stream URL');
  let buffer = 0, bits = 0, output = '';
  for (const letter of input) {
    buffer = (buffer << 6) | alphabet.indexOf(letter);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 255);
      buffer &= (1 << bits) - 1;
    }
  }
  return output;
};
export const decodeKodikUrl = (value: string): string => {
  const decoded = value.includes('//') ? value : decodeBase64(value.replace(/[a-zA-Z]/g, (letter) => {
    const code = letter.charCodeAt(0) + 18;
    const limit = letter <= 'Z' ? 90 : 122;
    return String.fromCharCode(code > limit ? code - 26 : code);
  }));
  const url = new URL(decoded.startsWith('//') ? 'https:' + decoded : decoded);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid stream URL');
  return url.href;
};
export const getKodikVideo = async (link: string): Promise<FilmVideoInterface> => {
  const url = new URL(link);
  if (!['kodikplayer.com', 'kodik.info', 'kodik.biz'].includes(url.hostname)) throw new Error('Этот внешний плеер Anixart пока не поддерживается: ' + url.hostname);
  const html = await requestText(link);
  const body = new URLSearchParams();
  for (const key of ['domain', 'd_sign', 'pd', 'pd_sign', 'ref', 'ref_sign']) {
    const value = html.match(new RegExp('var ' + key + ' = "([^"]*)"'))?.[1];
    if (value === undefined) throw new Error('Kodik player metadata unavailable');
    body.set(key === 'domain' ? 'd' : key, value);
  }
  for (const key of ['type', 'hash', 'id']) {
    const value = html.match(new RegExp("vInfo\\." + key + " = '([^']*)'"))?.[1];
    if (!value) throw new Error('Kodik video identity unavailable');
    body.set(key, value);
  }
  body.set('bad_user', 'false');
  body.set('cdn_is_working', 'true');
  const headers = { Referer: link, Origin: url.origin };
  const data = JSON.parse(await requestText(url.origin + '/ftor', {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(),
  })) as { links?: Record<string, { src: string } | { src: string }[]>; link?: string };
  const streams = Object.entries(data.links ?? {}).flatMap(([quality, entries]) =>
    (Array.isArray(entries) ? entries : [entries]).map((entry) => ({ url: decodeKodikUrl(entry.src), quality: quality + 'p', headers })));
  if (!streams.length && data.link) streams.push({ url: decodeKodikUrl(data.link), quality: 'auto', headers });
  if (!streams.length) throw new Error('Anixart не вернул доступных потоков.');
  return { streams };
};
const loadEpisodes = async (film: FilmInterface, voice: FilmVoiceInterface) => {
  const releaseId = anixartReleaseId(film.link);
  const sources = (await requestAnixart(`/episode/${releaseId}/${voice.id}`)).sources ?? [];
  const source = sources.find((item) => item.name === 'Kodik') ?? sources[0];
  if (!source) throw new Error('Для этой озвучки нет доступных серий.');
  const episodes = (await requestAnixart(`/episode/${releaseId}/${voice.id}/${source.id}`)).episodes ?? [];
  return { source, episodes };
};
const videoByEpisode = async (film: FilmInterface, voice: FilmVoiceInterface, episodeId: string) => {
  if (film.isRestricted) throw new Error('Воспроизведение этого релиза отключено источником Anixart.');
  const { source, episodes } = await loadEpisodes(film, voice);
  const selected = episodes.find((episode) => String(episode.position) === episodeId);
  if (!selected) throw new Error('Эта серия недоступна в выбранной озвучке.');
  const episode = selected.url ? selected : (await requestAnixart(`/episode/target/${anixartReleaseId(film.link)}/${source.id}/${selected.position}`)).episode ?? selected;
  if (!episode.url) throw new Error('Anixart не вернул ссылку серии.');
  if (episode.iframe) return getKodikVideo(episode.url);
  const url = new URL(episode.url);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid Anixart video URL');
  return { streams: [{ url: url.href, quality: 'auto' }] };
};
const AnixartPlaybackAdapter: SourcePlaybackAdapter = {
  source: ContentSource.ANIXART,
  async getFilmVoices(film) {
    const types = (await requestAnixart('/episode/' + anixartReleaseId(film.link))).types ?? [];
    return types.map((type, index) => ({
      id: String(type.id), identifier: 'anixart:' + type.id, title: type.name, img: type.icon,
      isCamrip: '0', isDirector: '0', isAds: '0', isPremium: false, isActive: index === 0,
    }));
  },
  async getFilmSeasons(film, voice) {
    const { episodes } = await loadEpisodes(film, voice);
    return { ...voice, seasons: [{ seasonId: '1', name: film.title, isOnlyEpisodes: true,
      episodes: episodes.map((episode) => ({ episodeId: String(episode.position), name: episode.name })) }] };
  },
  async getFilmStreamsByVoice(film, voice) {
    const { episodes } = await loadEpisodes(film, voice);
    if (!episodes.length) throw new Error('Для этой озвучки нет доступных серий.');
    return videoByEpisode(film, voice, String(episodes[0].position));
  },
  getFilmStreamsByEpisodeId(film, voice, _seasonId, episodeId) { return videoByEpisode(film, voice, episodeId); },
};
export default AnixartPlaybackAdapter;
