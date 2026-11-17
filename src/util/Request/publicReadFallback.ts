import { SourceBlockedError } from './sourceFailure';
// One bounded read of the public mirror, shared by notifications/badge callers.
export const createPublicReadFallback = <T>(ttl = 60_000, timeout = 15_000) => {
  let cached: { until: number; value: Promise<T> } | undefined;
  return async (primary: () => Promise<T>, fallback: (signal: AbortSignal) => Promise<T>): Promise<T> => {
    try { return await primary(); }
    catch (error) {
      if (!(error instanceof SourceBlockedError)) throw error;
      if (!cached || Date.now() >= cached.until) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        cached = { until: Date.now() + ttl, value: fallback(controller.signal).finally(() => clearTimeout(timer)) };
      }
      return cached.value;
    }
  };
};