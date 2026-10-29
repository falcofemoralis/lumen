import { withDeadline } from '../../source/request';

/** Coalesce a challenge while guaranteeing that a lost native promise releases the session. */
export const runBoundedChallenge = (
  attempts: Map<string, Promise<boolean>>, host: string, execute: () => Promise<boolean>,
  milliseconds: number, abort?: () => void,
): Promise<boolean> => {
  const pending = attempts.get(host);
  if (pending) return pending;
  const attempt = withDeadline(Promise.resolve().then(execute), milliseconds, 'Проверка источника не завершилась вовремя.', abort)
    .catch(() => false).finally(() => { if (attempts.get(host) === attempt) attempts.delete(host); });
  attempts.set(host, attempt);
  return attempt;
};
