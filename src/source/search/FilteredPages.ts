import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
export type FilteredPageCursor = { next: number; exhausted: boolean };
/** Skip a small number of empty native pages without losing the remaining cursor. */
export const loadFilteredPages = async (
  cursor: FilteredPageCursor,
  displayPage: number,
  load: (page: number) => Promise<FilmListInterface>,
  prepare: (card: FilmCardInterface) => Promise<FilmCardInterface | null>,
): Promise<FilmListInterface> => {
  const films: FilmCardInterface[] = [];
  for (let attempt = 0; attempt < 3 && !cursor.exhausted && !films.length; attempt++) {
    const result = await load(cursor.next);
    const prepared: (FilmCardInterface | null)[] = new Array(result.films.length);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(4, result.films.length) }, async () => {
      while (next < result.films.length) {
        const index = next++;
        prepared[index] = await prepare(result.films[index]).catch(() => null);
      }
    }));
    films.push(...prepared.filter((card): card is FilmCardInterface => Boolean(card)));
    cursor.exhausted = cursor.next >= result.totalPages;
    cursor.next++;
  }
  return { films, totalPages: cursor.exhausted ? displayPage : displayPage + 1 };
};
