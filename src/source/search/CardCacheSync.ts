export type CardCacheKind = 'bookmarks' | 'home-cards' | 'home-catalogs';
export type CardCacheValue = { kind: CardCacheKind; key: string; entry: Record<string, unknown> };
let revision = 0;
const listeners = new Set<() => void>();
let publisher: (value: CardCacheValue, checked: number) => void = () => {};
export const setCardCachePublisher = (callback: typeof publisher) => { publisher = callback; };
export const publishCardCache = (kind: CardCacheKind, key: string, entry: object, checked: number) => publisher({ kind, key, entry: entry as Record<string, unknown> }, checked);
export const cardCacheRevision = () => revision;
export const subscribeCardCache = (callback: () => void) => { listeners.add(callback); return () => { listeners.delete(callback); }; };
type Store = { load<T>(key: string): T | null; save(key: string, value: unknown): boolean };
export const restoreCardCaches = (records: Record<string, { value?: unknown; meta: { deleted?: boolean } }>, store: Store): boolean => {
  const bookmarks = store.load<Record<string, any>>('bookmark-metadata-v1') ?? {};
  const home = store.load<{ cards: Record<string, any>; catalogs: Record<string, any> }>('home-card-cache-v1') ?? { cards: {}, catalogs: {} };
  home.cards ??= {}; home.catalogs ??= {};
  let changed = false;
  for (const record of Object.values(records)) {
    if (record.meta.deleted || !record.value || typeof record.value !== 'object') continue;
    const { kind, key, entry } = record.value as CardCacheValue;
    if (typeof key !== 'string' || !key || ['__proto__', 'constructor', 'prototype'].includes(key) || !entry || typeof entry !== 'object') continue;
    const checked = kind === 'bookmarks' ? entry.updatedAt : entry.checked;
    if (typeof checked !== 'number' || !Number.isFinite(checked) || checked < 0 || checked > Date.now() + 5 * 60 * 1000) continue;
    if (kind === 'home-catalogs') {
      const list = entry.list as { films?: unknown; totalPages?: unknown } | undefined;
      if (!list || !Array.isArray(list.films) || list.films.length > 100 || typeof list.totalPages !== 'number') continue;
    } else {
      const card = entry.card as { link?: unknown; title?: unknown } | undefined;
      if (!card || typeof card.link !== 'string' || typeof card.title !== 'string') continue;
    }
    const target = kind === 'bookmarks' ? bookmarks : kind === 'home-cards' ? home.cards : kind === 'home-catalogs' ? home.catalogs : null;
    if (!target) continue;
    const existing = target[key];
    const existingTime = kind === 'bookmarks' ? existing?.updatedAt : existing?.checked;
    if (typeof existingTime === 'number' && existingTime >= checked) continue;
    target[key] = entry; changed = true;
  }
  if (changed) {
    for (const target of [bookmarks, home.cards, home.catalogs]) {
      const limit = target === home.catalogs ? 100 : 3000;
      const keys = Object.keys(target).sort((a, b) => (target[b].updatedAt ?? target[b].checked ?? 0) - (target[a].updatedAt ?? target[a].checked ?? 0));
      keys.slice(limit).forEach(key => delete target[key]);
    }
    store.save('bookmark-metadata-v1', bookmarks);
    store.save('home-card-cache-v1', home);
    revision++; listeners.forEach(callback => callback());
  }
  return changed;
};