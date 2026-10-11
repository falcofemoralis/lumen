import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { parseHtml } from 'Util/Parser';
import { fetchZonaText } from '../request';

/** The public page embeds its first batch. Its next-page API currently requires authorization. */
export const getZonaCollections = async (page: number): Promise<{ items: ContentCollectionInterface[]; totalPages: number }> => {
  if (page !== 1) return { items: [], totalPages: 1 };
  const root = parseHtml(await fetchZonaText('https://w1.zona.im/collections'));
  const items = new Map<string, ContentCollectionInterface>();
  for (const link of root.querySelectorAll('a[href^="/collections/"]')) {
    const path = link.attributes.href;
    const image = link.querySelector('img');
    const title = link.attributes.title ?? link.text.trim();
    if (!title || !image) continue;
    const url = 'https://w1.zona.im' + path;
    const src = image.attributes.src ?? '';
    // Next's image proxy carries the original image URL in its query.
    const proxy = src.startsWith('/_next/image') ? new URL(src, 'https://w1.zona.im').searchParams.get('url') : null;
    items.set(url, { id: 'ZONA:collection:' + path, title, url,
      image: proxy ?? (src.startsWith('/') ? 'https://w1.zona.im' + src : src), amount: 0, source: 'Zona' });
  }
  if (!items.size) throw new Error('Zona collections metadata not found');
  return { items: Array.from(items.values()), totalPages: 1 };
};
