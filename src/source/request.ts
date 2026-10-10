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

export const fetchZonaText = (url: string, milliseconds = 12_000): Promise<string> => {
  const controller = new AbortController();
  return withDeadline((async () => {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Zona: HTTP ' + response.status);
    return response.text();
  })(), milliseconds, 'Zona не ответила вовремя. Повторите попытку.', () => controller.abort());
};
