import { withDeadline } from '../request';
import { SourceBlockedError } from '../../util/Request/sourceFailure';

export const ANIXART_BASE_URL = 'https://anixart-app.com';
const API_URL = 'https://api-s.anixsekai.com';
export interface AnixartRelease {
  id: number; title_ru: string; title_original?: string; image: string;
  year?: string; country?: string; genres?: string; description?: string; director?: string;
  category?: { id: number; name: string }; status?: { id: number; name: string };
  status_id?: number; category_id?: number;
  episodes_released?: number; episodes_total?: number; grade?: number; vote_count?: number;
  duration?: number; age_rating?: number; is_play_disabled?: boolean; is_deleted?: boolean;
  imdb_id?: string; kinopoisk_id?: number; shikimori_id?: number;
  related_releases?: AnixartRelease[]; recommended_releases?: AnixartRelease[];
}
export interface AnixartDub { id: number; name: string; icon?: string; episodes_count?: number; is_sub?: boolean }
export interface AnixartEpisode { position: number; name: string; url: string; iframe: boolean }
export interface AnixartResponse {
  code: number; release?: AnixartRelease; content?: AnixartRelease[];
  total_page_count?: number; current_page?: number;
  types?: AnixartDub[]; sources?: { id: number; name: string; episodes_count: number }[];
  episodes?: AnixartEpisode[]; episode?: AnixartEpisode;
}
const cached = new Map<string, { time: number; value: Promise<AnixartResponse> }>();
const releases = new Map<string, { time: number; release: AnixartRelease; detailed: boolean }>();
let queue: Promise<unknown> = Promise.resolve();
let lastStarted = 0;
let blockedUntil = 0;
export const rememberAnixartRelease = (release: AnixartRelease, detailed = true) => {
  const existing = releases.get(String(release.id));
  // Partial search rows must not replace full metadata.
  if (!detailed && existing?.detailed && Date.now() - existing.time < 5 * 60_000) return;
  releases.set(String(release.id), { time: Date.now(), release, detailed });
  if (releases.size > 1000) releases.delete(releases.keys().next().value!);
};
export const getAnixartRelease = async (id: string): Promise<AnixartRelease | undefined> => {
  const known = releases.get(id);
  if (known?.detailed && Date.now() - known.time < 5 * 60_000) return known.release;
  return (await requestAnixart('/release/' + id)).release;
};
export const requestAnixart = <T = AnixartResponse>(path: string, body?: Record<string, unknown>, refresh = false): Promise<T> => {
  if (Date.now() < blockedUntil) return Promise.reject(new SourceBlockedError('Anixart временно ограничил запросы. Повторите позже.'));
  const key = JSON.stringify([path, body]);
  const existing = cached.get(key);
  if (!refresh && existing && Date.now() - existing.time < 60_000) return existing.value as Promise<T>;
  const value = queue.catch(() => undefined).then(async () => {
    const delay = Math.max(0, 500 - (Date.now() - lastStarted));
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if (Date.now() < blockedUntil) throw new SourceBlockedError('Anixart временно ограничил запросы. Повторите позже.');
    const controller = new AbortController();
    lastStarted = Date.now();
    return withDeadline((async () => {
      const response = await fetch(API_URL + path, {
        method: body ? 'POST' : 'GET', signal: controller.signal,
        headers: { 'Accept': 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.status === 403 || response.status === 429) {
        blockedUntil = Date.now() + 5 * 60_000;
        throw new SourceBlockedError('Anixart временно ограничил запросы. Повторите позже.');
      }
      if (!response.ok) throw new Error('Anixart: HTTP ' + response.status);
      const data = await response.json() as AnixartResponse;
      if (data.code !== 0) throw new Error('Anixart: ошибка API ' + data.code);
      if (data.release) rememberAnixartRelease(data.release);
      // Comments and other endpoints also use content; never cache them as releases.
      data.content?.filter(item => typeof item.title_ru === 'string' && typeof item.id === 'number').forEach(item => rememberAnixartRelease(item, Boolean(item.status && item.category)));
      return data;
    })(), 12_000, 'Anixart не ответил вовремя.', () => controller.abort());
  }).catch((error) => { cached.delete(key); throw error; });
  queue = value;
  cached.set(key, { time: Date.now(), value });
  if (cached.size > 500) cached.delete(cached.keys().next().value!);
  return value as Promise<T>;
};
export const anixartReleaseId = (link: string) => {
  const url = new URL(link);
  if (url.hostname !== 'anixart-app.com') throw new Error('Invalid Anixart link');
  const id = url.pathname.match(/^\/release\/(\d+)\/?$/)?.[1];
  if (!id) throw new Error('Invalid Anixart release ID');
  return id;
};
