import { cardCacheRevision, publishCardCache } from './CardCacheSync';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { enabledSourceKey } from '../types/SourceSelection';

export const BOOKMARK_METADATA_TTL = 7 * 24 * 60 * 60 * 1000;
export const BOOKMARK_METADATA_KEY = 'bookmark-metadata-v1';
export const BOOKMARK_INCOMPLETE_METADATA_TTL = 6 * 60 * 60 * 1000;
type Entry = { updatedAt: number; card: FilmCardInterface; animationSourceChecked?: boolean; seriesInfoChecked?: boolean; seriesInfoVersion?: number; subtitleChecked?: boolean; availabilityChecked?: boolean; availabilityVersion?: number; metadataVersion?: number; sourceSelection?: string };
type Entries = Record<string, Entry>;

export class BookmarkMetadataCache {
  private revision = cardCacheRevision();
  private refreshCloud() {
    if (this.revision !== cardCacheRevision()) { this.entries = this.store.load<Entries>(BOOKMARK_METADATA_KEY) ?? {}; this.revision = cardCacheRevision(); }
  }
  private entries: Entries;
  private pending = new Map<string, Promise<FilmCardInterface>>();
  private saveTimer?: ReturnType<typeof setTimeout>;
  private lastSavedAt = 0;
  private persist() {
    if (Date.now() - this.lastSavedAt >= 250) {
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = undefined;
      this.store.save(BOOKMARK_METADATA_KEY, this.entries);
      this.lastSavedAt = Date.now();
    } else if (!this.saveTimer) {
      this.saveTimer = setTimeout(() => {
        this.saveTimer = undefined;
        this.store.save(BOOKMARK_METADATA_KEY, this.entries);
        this.lastSavedAt = Date.now();
      }, 250);
    }
  }
  constructor(
    private store: { load<T>(key: string): T | null; save(key: string, value: unknown): boolean },
    private resolveCard: (card: FilmCardInterface) => Promise<FilmCardInterface>,
    private now = () => Date.now(),
  ) {
    const saved = store.load<Entries>(BOOKMARK_METADATA_KEY);
    this.entries = saved && typeof saved === 'object' ? saved : {};
  }
  peek(card: FilmCardInterface): FilmCardInterface {
    this.refreshCloud();
    const cached = this.entries[card.link]?.card;
    return cached?.link ? cached.id === card.id ? cached : { ...cached, id: card.id } : card;
  }
  resolve(card: FilmCardInterface): Promise<FilmCardInterface> {
    this.refreshCloud();
    const entry = this.entries[card.link];
    const needsSourceCheck = entry && (entry.metadataVersion !== 7 || entry.sourceSelection !== enabledSourceKey());
    const needsAnixartCheck = entry && !entry.animationSourceChecked
      && [card.type, entry.card.type].some((type) => type === FilmType.ANIME || type === FilmType.DONGHUA);
    const episodic = [card.type, entry?.card.type].some(type => type !== undefined
      && [FilmType.SERIES, FilmType.ANIME, FilmType.DONGHUA, FilmType.CARTOON, FilmType.TV_SHOW].includes(type));
    const needsSeriesInfoCheck = entry && episodic && (!entry.seriesInfoChecked || entry.seriesInfoVersion !== 2);
    const info = entry?.card.info?.trim() ?? '';
    // A complete refresh is cached weekly; missing episodic metadata can be retried sooner.
    const incomplete = entry?.card.isEpisodic !== false && entry?.card.isPendingRelease !== true && episodic && (!info || !/серия\s+\d+|\d+\s*\/\s*\d+|заверш[её]н|вышел/i.test(info));

    const ttl = incomplete ? BOOKMARK_INCOMPLETE_METADATA_TTL : BOOKMARK_METADATA_TTL;
    const needsSubtitleCheck = entry && !entry.subtitleChecked &&
      /^https?:\/\/(?:[^/]*\.zona\.im|anixart-app\.com)\//.test(entry.card.link);
    const needsAvailabilityCheck = entry?.card.isPendingRelease === true && (!entry.availabilityChecked || entry.availabilityVersion !== 2);
    if (entry?.card?.link && !needsAnixartCheck && !needsSeriesInfoCheck && !needsSubtitleCheck && !needsAvailabilityCheck && !needsSourceCheck && this.now() - entry.updatedAt < ttl) {
      return Promise.resolve(this.peek(card));
    }
    const existing = this.pending.get(card.link);
    if (existing) return existing.then((value) => ({ ...value, id: card.id }));
    const value = this.resolveCard(this.peek(card)).then((resolved) => {
      this.entries[card.link] = { updatedAt: this.now(), card: resolved, animationSourceChecked: true, seriesInfoChecked: true, seriesInfoVersion: 2, subtitleChecked: true, availabilityChecked: true, availabilityVersion: 2, metadataVersion: 7, sourceSelection: enabledSourceKey() };
      const keys = Object.keys(this.entries);
      if (keys.length > 3000) {
        keys.sort((a, b) => this.entries[a].updatedAt - this.entries[b].updatedAt)
          .slice(0, keys.length - 3000).forEach((key) => { delete this.entries[key]; });
      }
      this.persist();
      publishCardCache('bookmarks', card.link, this.entries[card.link], this.entries[card.link].updatedAt);
      return { ...resolved, id: card.id };
    }).catch(() => this.peek(card)).finally(() => { this.pending.delete(card.link); });
    this.pending.set(card.link, value);
    return value;
  }
}
