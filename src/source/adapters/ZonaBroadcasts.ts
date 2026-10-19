import { md5 } from '@noble/hashes/legacy.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { FilmInterface } from 'Type/Film.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmType } from 'Type/FilmType.type';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { fetchZonaText } from '../request';
// Exact channel-name matches from the public iptv-org channels/logos API (2026-10-19).
import channelLogos from './ZonaChannelLogos.json';

export interface ZonaBroadcast {
  id: string;
  title: string;
  image: string;
  imageFallback?: string;
  adult: boolean;
  kind: 'tv' | 'radio';
  streams: FilmStreamInterface[];
}
const httpUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
};
export const decodeZonaBroadcastUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  if (value.startsWith('zona:?xt=urn:m3u8:')) {
    try { return httpUrl(decodeURIComponent(value.slice('zona:?xt=urn:m3u8:'.length))); }
    catch { return null; }
  }

  return httpUrl(value);
};
export const zonaBroadcastImage = (value: unknown, kind: 'tv' | 'radio'): string => {
  const url = httpUrl(value);
  if (!url) return '';
  // Zona uses this cache path for remote logos, including defunct image hosts.
  const hash = bytesToHex(md5(utf8ToBytes(url)));
  const extension = new URL(url).pathname.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? 'jpg';
  const path = `${hash.slice(0, 2)}/${hash}.${extension}`;
  let code = 0;
  for (let index = 0; index < path.length; index++) code = (Math.imul(code, 31) + path.charCodeAt(index)) | 0;

  return `http://bimg${Math.abs(code) % 4 + 1}.zonapic.com/broadcast/${kind}/img/${path}`;
};

export const parseZonaBroadcasts = (input: unknown, kind: 'tv' | 'radio'): ZonaBroadcast[] => {
  if (!Array.isArray(input)) throw new Error('Invalid Zona broadcast catalog');

  return input.flatMap(raw => {
    if (!raw || typeof raw !== 'object') return [];
    const id = kind === 'tv' ? raw.id : raw.itemId;
    const title = kind === 'tv' ? raw.name : raw.title;
    if (typeof id !== 'string' || typeof title !== 'string') return [];
    const links = kind === 'tv' ? raw.links : raw.streams;
    const streams: FilmStreamInterface[] = [];
    for (const link of Array.isArray(links) ? links : []) {
      const url = decodeZonaBroadcastUrl(link?.u);
      if (!url || streams.some(stream => stream.url === url)) continue;
      streams.push({ url, quality: String(streams.length + 1) });
    }
    if (!streams.length) return [];

    const original = httpUrl(kind === 'tv' ? raw.imageURL : raw.preview) ?? '';
    const known = kind === 'tv' ? (channelLogos as Record<string, string>)[title] : '';

    return [{ id, title, image: known || zonaBroadcastImage(original, kind), imageFallback: original || undefined,
      adult: raw.adult === true || raw.adult === 'true', kind, streams }];
  });
};
export const getZonaBroadcasts = async (kind: 'tv' | 'radio'): Promise<ZonaBroadcast[]> => {
  const url = kind === 'tv' ? 'http://tv.zonasearch.com/newchannels8.json'
    : 'http://radio.zonasearch.com/radio2.json';

  return parseZonaBroadcasts(JSON.parse(await fetchZonaText(url)), kind);
};
export const resolveZonaBroadcastStream = async (stream: FilmStreamInterface): Promise<FilmStreamInterface> => {
  if (!/\.(?:m3u|pls)(?:\?|$)/i.test(stream.url)) return stream;
  const playlist = await fetchZonaText(stream.url);
  const candidates = playlist.split(/\r?\n/).map(line => line.trim().replace(/^File\d+=/i, ''));
  const url = candidates.map(httpUrl).find(Boolean);
  if (!url) throw new Error('No playable URL in radio playlist');

  return { ...stream, url };
};

export const resolveZonaBroadcastVideo = async (broadcast: ZonaBroadcast): Promise<FilmVideoInterface> => {
  const results = await Promise.allSettled(broadcast.streams.map(resolveZonaBroadcastStream));
  const streams = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
  if (!streams.length) throw new Error('No playable broadcast stream');

  return { streams };
};

export const zonaBroadcastSession = (broadcast: ZonaBroadcast, video: FilmVideoInterface) => {
  const voice: FilmVoiceInterface = { id: 'live', identifier: 'live', title: broadcast.title, video,
    isCamrip: '', isDirector: '', isAds: '', isPremium: false, isActive: true };
  const film: FilmInterface = { id: `ZONA:live:${broadcast.kind}:${broadcast.id}`, title: broadcast.title,
    link: `https://w1.zona.im/broadcast/${broadcast.kind}/${encodeURIComponent(broadcast.id)}`,
    poster: broadcast.image, type: FilmType.TV_SHOW, voices: [voice], hasVoices: false, hasSeasons: false };

  return { film, voice, video };
};