import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useQuery } from '@tanstack/react-query';
import { FilmRatingsInterface } from 'Type/FilmRatings.interface';
import { enqueueRatingRequest } from 'Util/RatingRequestQueue';
import {
  getCachedFilmRatings,
  saveCachedFilmRatings,
} from 'Util/RatingStore';
import { queryKeys } from 'Util/Query';
import { ContentSource } from '../source/types/ContentSource';
import { isSourceEnabled } from '../source/types/SourceSelection';
import RezkaSourceAdapter from '../source/adapters/RezkaSourceAdapter';
import ZonaSourceAdapter from '../source/adapters/ZonaSourceAdapter';
import { sourceRouter } from '../source';

const RATING_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

const hasPositiveRating = (value: unknown): value is number => (
  typeof value === 'number'
  && Number.isFinite(value)
  && value > 0
);

const hasExternalRatings = (
  ratings?: FilmRatingsInterface,
): boolean => (
  hasPositiveRating(ratings?.imdb)
  || hasPositiveRating(ratings?.kinopoisk)
);

const isUnifiedFilmId = (filmId?: string): boolean => (
  Boolean(filmId && /^(EXTERNAL|CONTENT|ZONA|REZKA):/.test(filmId))
);

export const useFilmRatings = (
  filmId?: string,
  isVisible = true,
  suppliedRatings?: FilmRatingsInterface,
  ratingSourceType?: ContentSource,
  ratingFilmId?: string,
) => {
  const { showRatings } = useConfigContext();
  const { isInternetAvailable } = useNetworkContext();
  const { currentService } = useServiceContext();

  const serviceType = ratingSourceType ?? currentService.type;
  const cacheFilmId = ratingFilmId ?? filmId ?? '';

  const cached = cacheFilmId
    ? getCachedFilmRatings(serviceType, cacheFilmId)
    : null;

  const hasSuppliedExternalRatings = hasExternalRatings(suppliedRatings);
  const isUnifiedId = isUnifiedFilmId(filmId);

  const initialRatings = hasSuppliedExternalRatings
    ? suppliedRatings
    : cached?.ratings ?? suppliedRatings;

  const enabled = (
    Boolean(filmId)
    && showRatings
    && isInternetAvailable
    && isVisible
    && isSourceEnabled(serviceType as ContentSource) && !hasSuppliedExternalRatings
    && (!isUnifiedId || Boolean(ratingSourceType && ratingFilmId))
  );

  const query = useQuery<FilmRatingsInterface>({
    queryKey: queryKeys.filmRatings(serviceType, cacheFilmId),
    queryFn: () => ratingSourceType === ContentSource.ZONA && ratingFilmId
      ? ZonaSourceAdapter.getFilmRatings!(ratingFilmId).then(ratings => {
        if (Object.keys(ratings).length) saveCachedFilmRatings(serviceType, cacheFilmId, ratings);
        return ratings;
      })
      : enqueueRatingRequest(
      `${serviceType}:${cacheFilmId}`,
      async () => {
        const ratings = ratingSourceType === ContentSource.REZKA && ratingFilmId
          ? await RezkaSourceAdapter.getFilmRatings!(ratingFilmId)
          : ratingSourceType === ContentSource.ANIXART && ratingFilmId
            ? await sourceRouter.getAnixartExternalRatings(ratingFilmId)
          : ratingSourceType === ContentSource.ZONA && ratingFilmId
            ? await ZonaSourceAdapter.getFilmRatings!(ratingFilmId)
            : await currentService.getFilmRatings(filmId ?? '');

        if (Object.keys(ratings).length > 0 || ratingSourceType === ContentSource.ANIXART) {
          saveCachedFilmRatings(serviceType, cacheFilmId, ratings);
        }

        return ratings;
      },
    ),
    enabled,
    meta: { silent: true },
    initialData: initialRatings,
    initialDataUpdatedAt: cached?.checked
      ? cached.updatedAt
      : 0,
    staleTime: RATING_CACHE_TTL,
    gcTime: RATING_CACHE_TTL,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // initialData only seeds a query once; a later search page can enrich this card.
  const imdbRating = hasPositiveRating(suppliedRatings?.imdb)
    ? suppliedRatings.imdb
    : query.data?.imdb;
  const kinopoiskRating = hasPositiveRating(suppliedRatings?.kinopoisk)
    ? suppliedRatings.kinopoisk
    : query.data?.kinopoisk;

  const hasImdbRating = (
    typeof imdbRating === 'number'
    && Number.isFinite(imdbRating)
    && imdbRating > 0
  );

  const hasKinopoiskRating = (
    !suppliedRatings?.imdbPending
    && typeof kinopoiskRating === 'number'
    && Number.isFinite(kinopoiskRating)
    && kinopoiskRating > 0
  );

  const rating = showRatings
    ? hasImdbRating
      ? imdbRating
      : hasKinopoiskRating
        ? kinopoiskRating
        : undefined
    : undefined;

  const ratingSource = showRatings
    ? hasImdbRating
      ? 'IMDb'
      : hasKinopoiskRating
        ? 'KP'
        : undefined
    : undefined;

  return {
    ...query,
    rating,
    ratingSource,
  };
};

export default useFilmRatings;
