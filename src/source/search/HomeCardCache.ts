import { cardCacheRevision, publishCardCache } from './CardCacheSync';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { enabledSourceKey } from '../types/SourceSelection';
export const HOME_STATUS_TTL = 24 * 60 * 60 * 1000;
const KEY = 'home-card-cache-v1';
type Entry = { card: FilmCardInterface; checked: number; sources: string; statusVersion?: number };
type Saved = { cards: Record<string, Entry>; catalogs: Record<string, FilmListInterface | { list: FilmListInterface; checked: number }> };
export class HomeCardCache {
  private revision = cardCacheRevision();
  private refreshCloud() {
    if (this.revision !== cardCacheRevision()) { this.saved = this.store.load<Saved>(KEY) ?? { cards: {}, catalogs: {} }; this.revision = cardCacheRevision(); }
  }
  private saved: Saved;
  private saveTimer?: ReturnType<typeof setTimeout>;
  private lastSavedAt = 0;
  private persist() {
    if (Date.now() - this.lastSavedAt >= 250) {
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = undefined;
      this.store.save(KEY, this.saved);
      this.lastSavedAt = Date.now();
    } else if (!this.saveTimer) {
      this.saveTimer = setTimeout(() => {
        this.saveTimer = undefined;
        this.store.save(KEY, this.saved);
        this.lastSavedAt = Date.now();
      }, 250);
    }
  }
  constructor(private store: { load<T>(key: string): T | null; save(key: string, value: unknown): boolean }, private now = () => Date.now()) {
    const value = store.load<Saved>(KEY);
    this.saved = { cards: value?.cards ?? {}, catalogs: value?.catalogs ?? {} };
  }
  peek(card: FilmCardInterface): FilmCardInterface {
    this.refreshCloud();
    const entry = this.saved.cards[card.link];
    return entry && entry.sources === enabledSourceKey() ? { ...entry.card, id: card.id } : card;
  }
  isFresh(card: FilmCardInterface): boolean {
    this.refreshCloud();
    const entry = this.saved.cards[card.link];
    return !!entry && entry.sources === enabledSourceKey() && (!entry.card.link.includes('.zona.im/tvseries/') || (entry.statusVersion === 2 && Boolean(entry.card.info?.trim()))) && this.now() - entry.checked < HOME_STATUS_TTL;
  }
  remember(original: FilmCardInterface, resolved: FilmCardInterface): void {
    this.refreshCloud();
    if (resolved.contentTypePending) return;
    this.saved.cards[original.link] = { card: resolved, checked: this.now(), sources: enabledSourceKey(), statusVersion: 2 };
    publishCardCache('home-cards', original.link, this.saved.cards[original.link], this.saved.cards[original.link].checked);
    const keys = Object.keys(this.saved.cards);
    if (keys.length > 3000) keys.sort((a, b) => this.saved.cards[a].checked - this.saved.cards[b].checked).slice(0, keys.length - 3000).forEach(key => delete this.saved.cards[key]);
    this.persist();
  }
  catalog(id: string): FilmListInterface | undefined { this.refreshCloud(); const entry = this.saved.catalogs[enabledSourceKey() + ':' + id]; return entry && ('list' in entry ? entry.list : entry); }
  rememberCatalog(id: string, list: FilmListInterface): void {
    this.refreshCloud();
    const key = enabledSourceKey() + ':' + id;
    const entry = { list: { ...list, films: list.films.slice(0, 100) }, checked: this.now() };
    this.saved.catalogs[key] = entry;
    publishCardCache('home-catalogs', key, entry, entry.checked);
    const keys = Object.keys(this.saved.catalogs);
    keys.slice(0, Math.max(0, keys.length - 100)).forEach(key => delete this.saved.catalogs[key]);
    this.store.save(KEY, this.saved);
  }
}