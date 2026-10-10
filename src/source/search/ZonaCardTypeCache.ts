import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
const KEY = 'zona-card-types-v1';
const TTL = 7 * 24 * 60 * 60 * 1000;
type Entry = { type: FilmType; checked: number };
export class ZonaCardTypeCache {
  private entries: Record<string, Entry>;
  constructor(private store: { load<T>(key: string): T | null; save(key: string, value: unknown): boolean }, private now = () => Date.now()) {
    this.entries = store.load<Record<string, Entry>>(KEY) ?? {};
  }
  peek(card: FilmCardInterface): FilmCardInterface {
    const entry = this.entries[card.link];
    return card.contentTypePending && entry && this.now() - entry.checked < TTL && Object.values(FilmType).includes(entry.type)
      ? { ...card, type: entry.type, contentTypePending: false } : card;
  }
  remember(card: FilmCardInterface): void {
    if (card.contentTypePending || !/^https?:\/\/[^/]*\.zona\.im\//.test(card.link)) return;
    if (this.entries[card.link]?.type === card.type && this.now() - this.entries[card.link].checked < TTL) return;
    this.entries[card.link] = { type: card.type, checked: this.now() };
    const keys = Object.keys(this.entries);
    if (keys.length > 3000) keys.sort((a, b) => this.entries[a].checked - this.entries[b].checked).slice(0, keys.length - 3000).forEach((key) => { delete this.entries[key]; });
    this.store.save(KEY, this.entries);
  }
}