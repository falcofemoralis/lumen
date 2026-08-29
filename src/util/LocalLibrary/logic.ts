import { BookmarkInterface } from 'Type/Bookmark.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import {
  LocalBookmarksBlob,
  LocalCategoryInterface,
  LocalHistoryItemInterface,
  LocalScheduleMarks,
} from 'Type/LocalLibrary.interface';
import { NotificationInterface, NotificationItemInterface } from 'Type/Notification.interface';
import { safeJsonParse } from 'Util/Json';

export const MAX_LOCAL_HISTORY_ITEMS = 200;

export type CategoryTitleError = 'empty' | 'exists';

export const emptyBookmarksBlob = (): LocalBookmarksBlob => ({
  categories: [],
  films: {},
});

export const parseBookmarksBlob = (raw: string | null | undefined): LocalBookmarksBlob => {
  const blob = safeJsonParse<LocalBookmarksBlob>(raw);

  if (!blob || !Array.isArray(blob.categories) || typeof blob.films !== 'object' || !blob.films) {
    return emptyBookmarksBlob();
  }

  return blob;
};

export const parseHistoryList = (raw: string | null | undefined): LocalHistoryItemInterface[] => {
  const items = safeJsonParse<LocalHistoryItemInterface[]>(raw);

  return Array.isArray(items) ? items : [];
};

export const parseScheduleMarks = (raw: string | null | undefined): LocalScheduleMarks => {
  const marks = safeJsonParse<LocalScheduleMarks>(raw);

  if (!marks || typeof marks !== 'object' || Array.isArray(marks)) {
    return {};
  }

  return marks;
};

/**
 * Removes film cards that are no longer referenced by any category.
 */
const collectReferencedFilms = (
  categories: LocalCategoryInterface[],
  films: Record<string, FilmCardInterface>
): Record<string, FilmCardInterface> => {
  const referencedIds = new Set(categories.flatMap((category) => category.filmIds));

  return Object.fromEntries(
    Object.entries(films).filter(([filmId]) => referencedIds.has(filmId))
  );
};

export const validateNewCategoryTitle = (
  blob: LocalBookmarksBlob,
  title: string
): CategoryTitleError | null => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return 'empty';
  }

  if (blob.categories.some((category) => category.title === trimmedTitle)) {
    return 'exists';
  }

  return null;
};

export const addCategory = (
  blob: LocalBookmarksBlob,
  category: LocalCategoryInterface
): LocalBookmarksBlob => ({
  ...blob,
  categories: [...blob.categories, category],
});

export const removeCategory = (
  blob: LocalBookmarksBlob,
  categoryId: string
): LocalBookmarksBlob => {
  const categories = blob.categories.filter((category) => category.id !== categoryId);

  return {
    categories,
    films: collectReferencedFilms(categories, blob.films),
  };
};

/**
 * Adds or removes a film in a category. No-op if the category does not exist.
 */
export const toggleBookmark = (
  blob: LocalBookmarksBlob,
  filmCard: FilmCardInterface,
  categoryId: string,
  isBookmarked: boolean
): LocalBookmarksBlob => {
  const category = blob.categories.find((c) => c.id === categoryId);

  if (!category) {
    return blob;
  }

  const filmIds = isBookmarked
    ? [filmCard.id, ...category.filmIds.filter((id) => id !== filmCard.id)]
    : category.filmIds.filter((id) => id !== filmCard.id);

  const categories = blob.categories.map((c) => (c.id === categoryId ? { ...c, filmIds } : c));

  const films = isBookmarked
    ? { ...blob.films, [filmCard.id]: filmCard }
    : collectReferencedFilms(categories, blob.films);

  return { categories, films };
};

/**
 * Maps local categories to the BookmarkInterface shape used by film.bookmarks.
 */
export const bookmarksForFilm = (
  blob: LocalBookmarksBlob,
  filmId: string
): BookmarkInterface[] => blob.categories.map((category) => ({
  id: category.id,
  title: category.title,
  isBookmarked: category.filmIds.includes(filmId),
}));

export const filmsForCategory = (
  blob: LocalBookmarksBlob,
  categoryId: string
): FilmCardInterface[] => {
  const category = blob.categories.find((c) => c.id === categoryId);

  if (!category) {
    return [];
  }

  return category.filmIds
    .map((filmId) => blob.films[filmId])
    .filter((film): film is FilmCardInterface => !!film);
};

/**
 * Puts the item at the top of the history, replacing any previous entry of the same film.
 */
export const upsertHistoryItem = (
  items: LocalHistoryItemInterface[],
  item: LocalHistoryItemInterface
): LocalHistoryItemInterface[] => [
  item,
  ...items.filter((i) => i.id !== item.id),
].slice(0, MAX_LOCAL_HISTORY_ITEMS);

export const removeHistoryItem = (
  items: LocalHistoryItemInterface[],
  filmId: string
): LocalHistoryItemInterface[] => items.filter((item) => item.id !== filmId);

export const setHistoryWatched = (
  items: LocalHistoryItemInterface[],
  filmId: string,
  isWatched: boolean
): LocalHistoryItemInterface[] => items.map(
  (item) => (item.id === filmId ? { ...item, isWatched } : item)
);

export const setScheduleMark = (
  marks: LocalScheduleMarks,
  filmId: string,
  scheduleItemId: string,
  isWatched: boolean
): LocalScheduleMarks => ({
  ...marks,
  [filmId]: {
    ...(marks[filmId] ?? {}),
    [scheduleItemId]: isWatched,
  },
});

/**
 * Pathname of a film link, so links match across provider mirrors and across
 * relative/absolute forms. Returns the raw input when it cannot be parsed.
 */
export const normalizeFilmLink = (link: string): string => {
  try {
    const { pathname } = new URL(link, 'https://mirror.invalid');

    return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  } catch {
    return link;
  }
};

export const collectLocalFilmLinks = (
  bookmarks: LocalBookmarksBlob,
  history: LocalHistoryItemInterface[]
): Set<string> => new Set(
  [
    ...Object.values(bookmarks.films).map((film) => film.link),
    ...history.map((item) => item.link),
  ].filter(Boolean).map(normalizeFilmLink)
);

const EPISODE_MARKER = /(\d+(?:-\d+)?)\s*сери\S*/;

/**
 * The episode marker of an update-row label ("2 серия", "1-8 серия"), so two
 * different episodes of one series released the same day both survive dedupe.
 */
export const extractEpisodeKey = (info: string): string => info.match(EPISODE_MARKER)?.[1] ?? '';

/**
 * The voice-over part of an update-row label — whatever follows the episode
 * marker in "(1 сезон) - 2 серия HDrezka Studio (Украинский)".
 */
export const extractVoiceFromInfo = (info: string): string => {
  const match = info.match(EPISODE_MARKER);

  if (!match || match.index === undefined) {
    return '';
  }

  return info.slice(match.index + match[0].length).trim();
};

/**
 * Voice titles comparable across their two sources: the film page ("Дубляж")
 * and the updates widget ("(Дубляж)") — lowercased, whitespace collapsed, and
 * a fully wrapping parenthesis pair removed. Inner qualifiers like "(18+)" or
 * "(Украинский)" stay, so they count as different voices.
 */
export const normalizeVoiceTitle = (voice: string): string => {
  const collapsed = voice.trim().replace(/\s+/g, ' ').toLowerCase();
  const unwrapped = collapsed.match(/^\((.*)\)$/);

  return (unwrapped ? unwrapped[1] : collapsed).trim();
};

/**
 * The updates widget emits one row per voice release of the same episode.
 * For films with a locally watched voice, only that exact voice's rows are
 * kept (no release in that voice → no notification, matching how the account
 * tracks a single translation). Films without a known voice (bookmarked but
 * never watched) collapse to one row per episode.
 */
export const dedupeUpdateItems = (
  items: NotificationItemInterface[],
  watchedVoiceByLink: Map<string, string>
): NotificationItemInterface[] => {
  const keptByKey = new Map<string, NotificationItemInterface>();

  items.forEach((item) => {
    const normalizedLink = normalizeFilmLink(item.link);
    const watchedVoice = normalizeVoiceTitle(watchedVoiceByLink.get(normalizedLink) ?? '');

    if (watchedVoice && normalizeVoiceTitle(extractVoiceFromInfo(item.info ?? '')) !== watchedVoice) {
      return;
    }

    const key = `${normalizedLink}|${extractEpisodeKey(item.info ?? '')}`;

    if (!keptByKey.has(key)) {
      keptByKey.set(key, item);
    }
  });

  return [...keptByKey.values()];
};

/**
 * Series-update date groups reduced to films present in the local library
 * (any bookmark category or the watch history), one row per film and episode;
 * empty groups are dropped.
 */
export const filterUpdatesForLocalLibrary = (
  updates: NotificationInterface[],
  bookmarks: LocalBookmarksBlob,
  history: LocalHistoryItemInterface[]
): NotificationInterface[] => {
  const localLinks = collectLocalFilmLinks(bookmarks, history);

  if (!localLinks.size) {
    return [];
  }

  const watchedVoiceByLink = new Map<string, string>();

  history.forEach((item) => {
    if (item.link && item.voiceTitle) {
      watchedVoiceByLink.set(normalizeFilmLink(item.link), item.voiceTitle);
    }
  });

  return updates
    .map((group) => ({
      ...group,
      items: dedupeUpdateItems(
        group.items.filter((item) => !!item.link && localLinks.has(normalizeFilmLink(item.link))),
        watchedVoiceByLink
      ),
    }))
    .filter((group) => group.items.length > 0);
};
