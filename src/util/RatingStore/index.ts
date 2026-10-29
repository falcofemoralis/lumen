import { FilmRatingsInterface } from 'Type/FilmRatings.interface';
import { storage } from 'Util/Storage';

export interface CachedFilmRatings {
  ratings: FilmRatingsInterface;
  updatedAt: number;
  checked: true;
}

const CACHE_PREFIX = 'film:v2:';
const storageInstance = () => storage.getRatingStorage();

const getKey = (serviceType: string, filmId: string) => (
  `${CACHE_PREFIX}${serviceType}:${filmId}`
);

export const getCachedFilmRatings = (
  serviceType: string,
  filmId: string,
): CachedFilmRatings | null => {
  if (!serviceType || !filmId) {
    return null;
  }

  return storageInstance().load<CachedFilmRatings>(
    getKey(serviceType, filmId)
  );
};

export const saveCachedFilmRatings = (
  serviceType: string,
  filmId: string,
  ratings: FilmRatingsInterface,
): void => {
  if (!serviceType || !filmId) {
    return;
  }

  storageInstance().save(getKey(serviceType, filmId), {
    ratings,
    updatedAt: Date.now(),
    checked: true,
  });
};

export const removeCachedFilmRatings = (
  serviceType: string,
  filmId: string,
): void => {
  if (!serviceType || !filmId) {
    return;
  }

  storageInstance().remove(getKey(serviceType, filmId));
};
