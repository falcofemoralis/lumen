/**
 * Every query key in the app is built here, so invalidation never has to guess the
 * shape of a key. Keys are grouped by prefix: invalidating `['films']` drops every
 * film list, invalidating `['films', 'home']` drops only the home lists.
 */
export const queryKeys = {
  film: (link: string) => ['film', link] as const,
  filmTrailer: (filmId: string) => ['film', filmId, 'trailer'] as const,
  comments: (filmId: string) => ['film', filmId, 'comments'] as const,

  films: {
    all: () => ['films'] as const,
    home: () => ['films', 'home'] as const,
    category: (link: string) => ['films', 'category', link] as const,
    search: (query: string) => ['films', 'search', query] as const,
    bookmarks: () => ['films', 'bookmarks'] as const,
  },

  actor: (link: string) => ['actor', link] as const,
  bookmarks: () => ['bookmarks'] as const,
  collections: () => ['collections'] as const,
  downloads: (path?: string) => ['downloads', path ?? null] as const,
  notifications: () => ['notifications'] as const,
  recent: () => ['recent'] as const,

  search: {
    suggestions: (query: string) => ['search', 'suggestions', query] as const,
    additionalContent: () => ['search', 'additional-content'] as const,
  },
} as const;

export default queryKeys;
