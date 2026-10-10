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