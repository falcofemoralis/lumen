import { enqueueRatingRequest, RatingRequestDroppedError } from 'Util/RatingRequestQueue';
export const enqueueBookmarkRequest = async <T>(key: string, execute: () => Promise<T>): Promise<T> => {
  for (;;) {
    try { return await enqueueRatingRequest(key, execute); }
    catch (error) {
      if (!(error instanceof RatingRequestDroppedError)) throw error;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};