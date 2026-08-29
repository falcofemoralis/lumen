import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { reportQueryError } from './errorHandler';

export const STALE_TIME = {
  /** Lists the user pulls to refresh; refetched whenever a screen is re-entered */
  NONE: 0,
  SHORT: 30 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 30 * 60 * 1000,
} as const;

export const GC_TIME = 15 * 60 * 1000;

export interface QueryMetaInterface {
  /** Skip the global error toast - the caller renders the failure itself */
  silent?: boolean;
}

const isSilent = (meta?: Record<string, unknown>) => meta?.silent === true;

export const createQueryClient = () => new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!isSilent(query.meta)) {
        reportQueryError(error);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (!isSilent(mutation.meta)) {
        reportQueryError(error);
      }
    },
  }),
  defaultOptions: {
    queries: {
      // screens are expected to show fresh data when re-entered, so opting into
      // caching is explicit per query via `staleTime`
      staleTime: STALE_TIME.NONE,
      gcTime: GC_TIME,
      // the scrapers fail fast on a dead provider; a single retry is enough
      retry: 1,
      // there is no window to focus on TV, and AppState churn should not refetch
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default createQueryClient;
