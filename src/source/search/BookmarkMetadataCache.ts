import { FilmCardInterface } from 'Type/FilmCard.interface';

export const BOOKMARK_METADATA_TTL = 7 * 24 * 60 * 60 * 1000;
export const BOOKMARK_METADATA_KEY = 'bookmark-metadata-v1';
type Entry = { updatedAt: number; card: FilmCardInterface };
type Entries = Record<string, Entry>;

export class BookmarkMetadataCache {
  private entries: Entries;
  private pending = new Map<string, Promise<FilmCardInterface>>();
  constructor(
    private store: { load<T>(key: string): T | null; save(key: string, value: unknown): boolean },
    private resolveCard: (card: FilmCardInterface) => Promise<FilmCardInterface>,
    private now = () => Date.now(),
  ) {
    const saved = store.load<Entries>(BOOKMARK_METADATA_KEY);
    this.entries = saved && typeof saved === 'object' ? saved : {};
  }
  peek(card: FilmCardInterface): FilmCardInterface {
    const cached = this.entries[card.link]?.card;
    return cached?.link ? { ...cached, id: card.id } : card;
  }
  resolve(card: FilmCardInterface): Promise<FilmCardInterface> {
    const entry = this.entries[card.link];
    if (entry?.card?.link && this.now() - entry.updatedAt < BOOKMARK_METADATA_TTL) {
      return Promise.resolve(this.peek(card));
    }
    const existing = this.pending.get(card.link);
    if (existing) return existing.then((value) => ({ ...value, id: card.id }));
    const value = this.resolveCard(card).then((resolved) => {
      this.entries[card.link] = { updatedAt: this.now(), card: resolved };
      const keys = Object.keys(this.entries);
      if (keys.length > 3000) {
        keys.sort((a, b) => this.entries[a].updatedAt - this.entries[b].updatedAt)
          .slice(0, keys.length - 3000).forEach((key) => { delete this.entries[key]; });
      }
      this.store.save(BOOKMARK_METADATA_KEY, this.entries);
      return { ...resolved, id: card.id };
    }).catch(() => this.peek(card)).finally(() => { this.pending.delete(card.link); });
    this.pending.set(card.link, value);
    return value;
  }
}
