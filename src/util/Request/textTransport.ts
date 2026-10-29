type TextResult = { response: Response; text: string };
export function createTextTransport(fetcher: typeof fetch, concurrency = 3) {
  const hosts = new Map<string, { active: number; queue:(() => void)[] }>();
  const execute = async (
    input: RequestInfo | URL,
    init: RequestInit = {},
    timeout = 15_000,
    timeoutMessage = 'Источник не ответил вовремя. Повторите попытку.'
  ): Promise<TextResult> => {
    const url = input instanceof Request ? input.url : input.toString();
    const host = new URL(url).origin;
    let state = hosts.get(host);
    if (!state) { state = { active: 0, queue: [] }; hosts.set(host, state); }
    const signal = init.signal ?? (input instanceof Request ? input.signal : undefined);
    const controller = new AbortController();
    const abort = () => controller.abort(signal?.reason);
    if (signal?.aborted) abort();
    signal?.addEventListener('abort', abort, { once: true });
    let timer: ReturnType<typeof setTimeout> | undefined;
    let start: (() => void) | undefined;
    let started = false;
    const aborted = new Promise<never>((_, reject) => {
      const fail = () => reject(controller.signal.reason ?? new Error('Request aborted'));
      controller.signal.addEventListener('abort', fail, { once: true });
      if (controller.signal.aborted) fail();
      timer = setTimeout(() => controller.abort(new Error(timeoutMessage)), timeout);
    });
    try {
      if (state.queue.length >= 64) throw new Error('Слишком много запросов к источнику. Повторите попытку позже.');
      await Promise.race([new Promise<void>(resolve => {
        start = () => { started = true; state!.active++; resolve(); };
        if (state!.active < concurrency) start(); else state!.queue.push(start);
      }), aborted]);
      const method = (init.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
      for (let attempt = 0; ; attempt++) {
        if (controller.signal.aborted) throw controller.signal.reason ?? new Error('Request aborted');
        const response = await Promise.race([fetcher(input, { ...init, signal: controller.signal }), aborted]);
        const text = await Promise.race([response.text(), aborted]);
        if (attempt === 0 && ['GET', 'HEAD'].includes(method) && [502, 503, 504].includes(response.status)) {
          await Promise.race([new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400)), aborted]);
          continue;
        }

        return { response, text };
      }
    } finally {
      if (timer) clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (started) state.active--;
      else if (start) state.queue = state.queue.filter(item => item !== start);
      while (state.active < concurrency && state.queue.length) state.queue.shift()!();
      if (!state.active && !state.queue.length) hosts.delete(host);
    }
  };
  const pending = new Map<string, Promise<TextResult>>();

  return (
    input: RequestInfo | URL, init: RequestInit = {}, timeout?: number, message?: string
  ): Promise<TextResult> => {
    if (input instanceof Request || init.signal || (init.method ?? 'GET').toUpperCase() !== 'GET') {
      return execute(input, init, timeout, message);
    }
    const headers = Array.from(new Headers(init.headers).entries()).sort(([a], [b]) => a.localeCompare(b));
    const key = JSON.stringify([
      input.toString(), headers, init.credentials, init.redirect, init.cache, timeout, message,
    ]);
    const existing = pending.get(key);
    if (existing) return existing;
    const operation = execute(input, init, timeout, message).finally(() => pending.delete(key));
    pending.set(key, operation);

    return operation;
  };
}
export const fetchTextResponse = createTextTransport((input, init) => fetch(input, init));