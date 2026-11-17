import { zonaDesktopOptions } from '../adapters/ZonaDesktopCatalog';
import { fetchZonaText } from '../request';
import { parseZonaTorrent, ZonaTorrentDocument, ZonaTorrentRelease } from './model';

const cache = new Map<string, { time: number; value: Promise<ZonaTorrentRelease[]> }>();
export const getZonaTorrents = (kinopoisk: string): Promise<ZonaTorrentRelease[]> => {
  if (!/^\d+$/.test(kinopoisk)) return Promise.reject(new Error('Invalid Kinopoisk ID'));
  const adult = zonaDesktopOptions().adult;
  const key = `${adult }:${ kinopoisk}`, cached = cache.get(key);
  if (cached && Date.now() - cached.time < 3 * 60_000) return cached.value;
  const params = new URLSearchParams({
    q: `kinopoisk_id:${kinopoisk} AND indexed:[1 TO 8]${adult ? '' : ' AND adult:false'}`,
    wt: 'json', rows: '120', sort: 'seeds desc,id asc',
    fl: 'hash,torrent_download_link,translate_info,language,resolution,seeds,filenames,'
      + 'files,episodes_map_auto,playable,trailer,private,adult' });
  const value = fetchZonaText(`http://zsolr3.zonasearch.com/solr/torrent/select/?${params}`).then(text => {
    const data = JSON.parse(text);
    if (!Array.isArray(data.response?.docs)) throw new Error('Invalid Zona torrent response');
    const seen = new Set<string>();
    const result = (data.response.docs as ZonaTorrentDocument[]).flatMap(doc => {
      const release = parseZonaTorrent(doc, adult);
      if (!release || seen.has(release.hash)) return [];
      seen.add(release.hash);

      return [release];
    });
    if (!result.length) cache.delete(key);

    return result;
  }).catch(error => { cache.delete(key); throw error; });
  cache.set(key, { time: Date.now(), value });
  while (cache.size > 64) cache.delete(cache.keys().next().value!);

  return value;
};
