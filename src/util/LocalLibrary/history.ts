import type { FilmCardInterface } from '../../type/FilmCard.interface';
import { FilmType } from '../../type/FilmType.type';
import type { LocalHistoryItemInterface } from '../../type/LocalLibrary.interface';
import { matchingBookmarkIds, mergeBookmarkSources } from './identity';

const cardFor = (item: LocalHistoryItemInterface): FilmCardInterface => item.filmCard ?? {
  id: item.id, link: item.link, title: item.title, poster: item.poster,
  subtitle: '', type: FilmType.FILM,
};

export const matchesHistoryFilm = (item: LocalHistoryItemInterface, card: FilmCardInterface): boolean =>
  matchingBookmarkIds({ categories: [], films: { candidate: cardFor(item) } }, card).length > 0;

export const deduplicateHistory = (items: LocalHistoryItemInterface[]): LocalHistoryItemInterface[] => {
  const result: LocalHistoryItemInterface[] = [];
  const sorted = [...items].sort((a, b) => b.updatedAt - a.updatedAt);
  const blob = {
    categories: [], films: Object.fromEntries(sorted.map((item, index) => [String(index), cardFor(item)])),
  };
  const groups = new Map<string, number>();
  for (const [itemIndex, item] of sorted.entries()) {
    const card = cardFor(item);
    const index = matchingBookmarkIds(blob, card).map(id => groups.get(id))
      .find(group => group !== undefined && matchesHistoryFilm(result[group], card));
    if (index === undefined) {
      groups.set(String(itemIndex), result.length);
      result.push(item);
      continue;
    }
    groups.set(String(itemIndex), index);
    const latest = result[index];
    const latestCard = cardFor(latest);
    result[index] = {
      ...latest,
      historyIds: [...new Set([latest.id, ...(latest.historyIds ?? []), item.id, ...(item.historyIds ?? [])])],
      filmCard: {
        ...card, ...latestCard,
        externalIds: { ...card.externalIds, ...latestCard.externalIds },
        ratings: { ...card.ratings, ...latestCard.ratings },
        sources: mergeBookmarkSources(card, latestCard),
      },
    };
  }

  return result;
};
