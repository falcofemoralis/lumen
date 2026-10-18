import { SourceBlockedError } from '../Request/sourceFailure';

export const isRecoverableSourceFailure = (error: unknown, now = Date.now()): boolean => {
  if (error instanceof SourceBlockedError) return error.retryAt !== undefined && error.retryAt <= now;
  if (isNetworkFailure(error)) return true;

  const message = (error instanceof Error ? error.message : String(error ?? ''))
    .replace(/^(?:(?:Error|TypeError):\s*)+/, '');

  return /^(?:(?:Zona|Anixart|HDRezka):\s*)?HTTP (?:502|503|504)\b/i.test(message)
    || /^(?:Zona не ответила|Anixart не ответил|Источник не ответил) вовремя\./.test(message)
    || /^(?:Network request timed out|Request timed out|The operation timed out)(?:[.:]|$)/i.test(message);
};

export function isNetworkFailure(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error ?? ''))
    .replace(/^(?:(?:Error|TypeError):\s*)+/, '');

  return /^(?:Network request failed|Failed to fetch|NetworkError when attempting to fetch resource\.?)$/i
    .test(message);
}

export function isChallengeCookie(name: string): boolean {
  return name === 'cf_clearance' || name.startsWith('__cf') || name.startsWith('cf_chl_') ||
    name.startsWith('techaro.lol-anubis');
}