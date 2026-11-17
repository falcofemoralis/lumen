export interface ZonaTorrentRelease {
  hash: string;
  link: string;
  title: string;
  quality: string;
  seeds: number;
  files: { path: string; size?: number; season?: number; episode?: number }[];
}
export interface ZonaTorrentDocument {
  hash?: string; torrent_download_link?: string; translate_info?: string; language?: string;
  resolution?: string; seeds?: number; filenames?: string; files?: string; episodes_map_auto?: string;
  playable?: boolean; trailer?: boolean; private?: boolean; adult?: boolean;
}
const json = (value: string | undefined): unknown => {
  try { return JSON.parse(value ?? 'null'); } catch { return null; }
};
export const isTorrentMediaFile = (path: string) => /\.(mp4|mkv|webm|avi|m4v|mov|ts|mpg|mpeg|m2ts|mts)$/i.test(path)
  && !/(?:^|[\/\\_. (\[-])(?:sample|trailer)\d*(?:[\/\\_. )\]-]|$)/i.test(path);
export const parseZonaTorrent = (doc: ZonaTorrentDocument, adult = false): ZonaTorrentRelease | null => {
  if (!doc.hash || !/^[a-f0-9]{40}$/i.test(doc.hash) || doc.trailer || doc.private
    || (!adult && doc.adult) || doc.playable === false) return null;
  const link = doc.torrent_download_link;
  if (!link?.startsWith('magnet:?')) return null;
  const params = new URLSearchParams(link.slice(8));
  if (params.get('xt')?.toLowerCase() !== `urn:btih:${ doc.hash.toLowerCase()}`) return null;
  const filenames = json(doc.filenames), mapping = json(doc.episodes_map_auto);
  const sizes = json(doc.files);
  if (!Array.isArray(filenames)) return null;
  const files = filenames.filter((file): file is string => typeof file === 'string' && isTorrentMediaFile(file))
    .map(path => {
      const mapped = mapping && typeof mapping === 'object'
        ? Object.entries(mapping).find(([, name]) => name === path)?.[0] : undefined;
      const match = (mapped ?? path).match(/(?:^|[^a-z0-9])s(\d{1,3})[ ._-]*e(\d{1,4})(?!\d)/i)
        ?? path.match(/(?:^|[^\d])(\d{1,2})x(\d{1,3})(?!\d)/i);

      const size = sizes && typeof sizes === 'object' ? (sizes as Record<string, unknown>)[path] : undefined;

      return { path, ...(typeof size === 'number' && Number.isFinite(size) && size > 0 ? { size } : {}),
        ...(match ? { season: Number(match[1]), episode: Number(match[2]) } : {}) };
    });
  if (!files.length) return null;
  const dimensions = doc.resolution?.match(/^(\d+)x(\d+)$/);
  const width = dimensions ? Number(dimensions[1]) : 0;
  const height = dimensions ? Number(dimensions[2]) : 0;
  const quality = width >= 3800 || height >= 2000 ? '2160p' : width >= 1800 || height >= 1000 ? '1080p'
    : width >= 1200 || height >= 700 ? '720p'
      : height >= 450 ? '480p' : doc.resolution || 'Original';

  return { hash: doc.hash.toLowerCase(), link, title: doc.translate_info?.trim() || doc.language || 'Original',
    quality, seeds: Math.max(0, doc.seeds ?? 0), files };
};
