import { fetchTextResponse } from '../util/Request/textTransport';
export const withDeadline = async <T>(
  operation: Promise<T>,
  milliseconds: number,
  message = 'Источник не ответил вовремя. Повторите попытку.',
  onTimeout?: () => void,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      onTimeout?.();
      reject(new Error(message));
    }, milliseconds);
  });
  try { return await Promise.race([operation, deadline]); }
  finally { if (timer !== undefined) clearTimeout(timer); }
};

const pendingZonaText = new Map<string, Promise<string>>();
export const fetchZonaText = (url: string, milliseconds = 12_000): Promise<string> => {
  const key = milliseconds + ':' + url;
  const existing = pendingZonaText.get(key);
  if (existing) return existing;
  const operation = fetchTextResponse(url, {}, milliseconds, 'Zona не ответила вовремя. Повторите попытку.').then(({ response, text }) => {
    if (!response.ok) throw new Error('Zona: HTTP ' + response.status);

    return text;
  }).finally(() => pendingZonaText.delete(key));
  pendingZonaText.set(key, operation);

return operation;
};