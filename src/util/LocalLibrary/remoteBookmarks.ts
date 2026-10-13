import type { BookmarkInterface } from '../../type/Bookmark.interface';
import type { FilmCardInterface } from '../../type/FilmCard.interface';
import type { LocalBookmarksBlob } from '../../type/LocalLibrary.interface';

export const cachedRemoteBookmarks = (
  metadata: BookmarkInterface[],
  pages: { categoryId: string; films: FilmCardInterface[] }[],
): LocalBookmarksBlob => {
  const blob: LocalBookmarksBlob = { categories: [], films: {} };
  const categories = new Map<string, LocalBookmarksBlob['categories'][number]>();
  const add = (id: string, title: string, films: FilmCardInterface[]) => {
    if (!categories.has(id)) categories.set(id, { id, title, filmIds: [], createdAt: 0 });
    const category = categories.get(id)!;
    for (const film of films) {
      if (!category.filmIds.includes(film.id)) category.filmIds.push(film.id);
      blob.films[film.id] = film;
    }
  };
  metadata.forEach(item => add(item.id, item.title, item.filmList?.films ?? []));
  pages.forEach(page => add(page.categoryId, categories.get(page.categoryId)?.title ?? page.categoryId, page.films));
  blob.categories = [...categories.values()];
  return blob;
};

export const mergeBookmarkFlags = (
  actual: BookmarkInterface[] = [],
  cached: BookmarkInterface[] = [],
): BookmarkInterface[] => {
  const result = new Map(cached.map(item => [item.id, item]));
  actual.forEach(item => result.set(item.id, {
    ...result.get(item.id), ...item,
    isBookmarked: Boolean(item.isBookmarked || result.get(item.id)?.isBookmarked),
  }));
  return [...result.values()];
};
