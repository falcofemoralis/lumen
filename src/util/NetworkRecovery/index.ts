import { SourceBlockedError } from '../Request/sourceFailure';

export const isRecoverableSourceFailure = (error: unknown, now = Date.now()): boolean =>
  isNetworkFailure(error) || (error instanceof SourceBlockedError && error.retryAt !== undefined && error.retryAt <= now);

export function isNetworkFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /^(?:TypeError: )?(?:Network request failed|Failed to fetch|NetworkError when attempting to fetch resource\.?)$/i.test(message);
}

export function isChallengeCookie(name: string): boolean {
  return name === 'cf_clearance' || name.startsWith('__cf') || name.startsWith('cf_chl_') ||
    name.startsWith('techaro.lol-anubis');
}