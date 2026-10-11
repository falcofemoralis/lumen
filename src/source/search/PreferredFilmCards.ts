import { FilmCardInterface } from 'Type/FilmCard.interface';

export const preferredCardsSignature = (cards: FilmCardInterface[]): string => JSON.stringify(cards.map((card) => card.link));

export const preferredCardsSnapshot = (
  cards: FilmCardInterface[],
  known: Map<string, FilmCardInterface>,
  fallback: (card: FilmCardInterface) => FilmCardInterface = (card) => card,
): Map<string, FilmCardInterface> => new Map(cards.map((card) => [card.link, known.get(card.link) ?? fallback(card)]));
// Keep the catalog image while background metadata changes. Weekly bookmarks
// and a verified switch to another source may intentionally refresh the image.
export const preferredCardForDisplay = (
  original: FilmCardInterface,
  enriched: FilmCardInterface = original,
  persistWeekly = false,
): FilmCardInterface => {
  const poster = !persistWeekly && original.link === enriched.link && original.poster
    ? original.poster : enriched.poster;
  return enriched.id === original.id && enriched.poster === poster
    ? enriched : { ...enriched, id: original.id, poster };
};
export const shouldRefreshZonaSeries = (card: FilmCardInterface, checkedAt?: number, now = Date.now()): boolean =>
  /^https?:\/\/[^/]*\.zona\.im\/tvseries\//.test(card.link)
  && !card.contentTypePending
  && (checkedAt === undefined || now - checkedAt >= 5 * 60 * 1000);
// Take one card per folder before returning to a large folder. Shared bookmarks are checked once.
export const cardsAcrossFolders = (folders: { films: FilmCardInterface[] | null }[]): FilmCardInterface[] => {
  const result: FilmCardInterface[] = [];
  const seen = new Set<string>();
  const size = Math.max(0, ...folders.map(folder => folder.films?.length ?? 0));
  for (let index = 0; index < size; index++) {
    for (const folder of folders) {
      const card = folder.films?.[index];
      if (card && !seen.has(card.link)) { seen.add(card.link); result.push(card); }
    }
  }
  return result;
};