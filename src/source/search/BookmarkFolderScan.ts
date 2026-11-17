import { BookmarkInterface } from 'Type/Bookmark.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
export type BookmarkFolderPage = FilmListInterface & { currentPage: number };
export const scanBookmarkFolders = async (
  bookmarks: BookmarkInterface[],
  read: (id: string) => BookmarkFolderPage | undefined,
  write: (id: string, page: BookmarkFolderPage) => void,
  fetchPage: (bookmark: BookmarkInterface, page: number) => Promise<FilmListInterface>,
): Promise<void> => {
  const pending = bookmarks.map(bookmark => ({ bookmark, done: false }));
  let failure: unknown;
  while (pending.some(item => !item.done)) {
    for (const item of pending) {
      if (item.done) continue;
      const existing = read(item.bookmark.id);
      if (existing && existing.currentPage >= existing.totalPages) { item.done = true; continue; }
      const page = (existing?.currentPage ?? 0) + 1;
      try {
        const result = page === 1 && item.bookmark.filmList ? item.bookmark.filmList : await fetchPage(item.bookmark, page);
        const latest = read(item.bookmark.id);
        if (!latest || latest.currentPage < page) {
          const seen = new Set<string>();
          const films = [...(latest?.films ?? []), ...result.films].filter(card => {
            if (seen.has(card.link)) return false;
            seen.add(card.link); return true;
          });
          write(item.bookmark.id, { films, currentPage: page, totalPages: result.totalPages });
        }
        if (page >= result.totalPages) item.done = true;
      } catch (error) { failure = error; item.done = true; }
    }
  }
  if (failure) throw failure;
};