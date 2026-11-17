import { fetchTextResponse } from '../../util/Request/textTransport';
import type { TorrentConnection } from '../../util/TorrentEngine';
import { withDeadline } from '../request';
import type { ZonaTorrentRelease } from './model';
import { isTorrentMediaFile } from './model';

interface TorrentFile { id: number; path: string; length?: number }
interface Status { hash?: string; file_stats?: TorrentFile[] }
const basename = (value: string) => value.replace(/\\/g, '/').split('/').pop();
export const matchTorrentFile = (files: TorrentFile[], path: string): TorrentFile | undefined => {
  const valid = files.filter(file => Number.isInteger(file.id) && file.id > 0 && isTorrentMediaFile(file.path));
  const exact = valid.filter(file => file.path.replace(/\\/g, '/') === path.replace(/\\/g, '/')
    || file.path.replace(/\\/g, '/').endsWith(`/${ path.replace(/\\/g, '/')}`));
  if (exact.length === 1) return exact[0];
  const matches = valid.filter(file => basename(file.path) === basename(path));

  return matches.length === 1 ? matches[0] : undefined;
};
export const createTorrentClient = (start: () => Promise<TorrentConnection>) => {
  const pending = new Map<string, Promise<TorrentFile[]>>();
  const preparing = new Map<string, Promise<void>>();
  const request = async (connection: TorrentConnection, route: string, body: object): Promise<Status> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(connection.baseUrl + route, { method: 'POST', signal: controller.signal,
        headers: { Authorization: connection.authorization, 'Content-Type': 'application/json' },
        body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`Torrent engine: HTTP ${ response.status}`);

      return await response.json();
    } finally { clearTimeout(timer); }
  };
  const files = (connection: TorrentConnection, release: ZonaTorrentRelease) => {
    const key = `${connection.baseUrl }:${ release.hash}`;
    const existing = pending.get(key);
    if (existing) return existing;
    const value = (async () => {
      let status = await request(connection, '/torrents', { action: 'add', link: release.link, save_to_db: false });
      const deadline = Date.now() + 35_000;
      while (!status.file_stats?.length && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 750));
        status = await request(connection, '/torrents', { action: 'get', hash: release.hash });
      }
      if (!status.file_stats?.length) throw new Error('Torrent metadata unavailable. No seeders responded.');

      return status.file_stats;
    })().finally(() => pending.delete(key));
    pending.set(key, value);

    return value;
  };

  return {
    async stream(release: ZonaTorrentRelease, path: string) {
      const connection = await start();
      const file = matchTorrentFile(await files(connection, release), path);
      if (!file) throw new Error('The selected torrent file is unavailable or ambiguous.');
      const params = new URLSearchParams({ link: release.hash, index: String(file.id), play: 'true' });
      const raw = `${connection.baseUrl}/stream/${encodeURIComponent(basename(file.path) ?? 'video.mkv')}?${params}`;
      const key = `${connection.baseUrl}:${release.hash}:${file.id}`;
      let prepared = preparing.get(key);
      if (!prepared) {
        prepared = (async () => {
          const warm = new URL(raw);
          warm.searchParams.delete('play');
          warm.searchParams.set('preload', 'true');
          warm.searchParams.set('stat', 'true');
          const headers = { Authorization: connection.authorization };
          const { response, text } = await fetchTextResponse(warm.href, { headers }, 60_000,
            'Торрент не подготовил буфер за минуту. Попробуйте другую раздачу.');
          if (!response.ok) throw new Error(`Торрент не подготовлен: HTTP ${response.status}`);
          const status = JSON.parse(text) as Status;
          if (!status.file_stats?.some(item => item.id === file.id)) {
            throw new Error('Выбранный файл исчез из раздачи. Выберите озвучку повторно.');
          }
          const controller = new AbortController();
          try {
            await withDeadline((async () => {
              const check = await fetch(raw, { headers: { ...headers, Range: 'bytes=0-65535' },
                signal: controller.signal });
              if (check.status !== 206 && !(check.status === 200 && file.length && file.length <= 65536)) {
                throw new Error(`Торрент не отдаёт выбранный видеофайл: HTTP ${check.status}`);
              }
              const bytes = await check.arrayBuffer();
              if (!bytes.byteLength || bytes.byteLength > 65536) {
                throw new Error('Торрент вернул пустой или неверный видеофайл.');
              }
            })(), 15_000, 'Раздача не передала начало видео. Попробуйте другую раздачу.', () => controller.abort());
          } finally { controller.abort(); }
        })().finally(() => preparing.delete(key));
        preparing.set(key, prepared);
      }
      await prepared;
      const url = connection.hls && /\.(mkv|webm|avi)$/i.test(file.path)
        ? `${connection.baseUrl}/gst/${release.hash}/master.m3u8?index=${file.id}` : raw;

      return { url, downloadUrl: raw, quality: release.quality,
        headers: { Authorization: connection.authorization } };
    },
  };
};
