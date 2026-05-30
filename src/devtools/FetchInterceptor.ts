const DEFAULT_IGNORE_CONTENT_TYPES = /^(image)\/.*$/i;

export interface FetchInterceptorOptions {
  ignoreUrls?: RegExp;
  ignoreContentTypes?: RegExp;
}

type FetchFn = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

function normalizeHeaders(raw: HeadersInit | null | undefined): Record<string, string> | null {
  if (!raw) return null;
  const out: Record<string, string> = {};
  if (raw instanceof Headers) {
    raw.forEach((value, key) => { out[key] = value; });
  } else if (Array.isArray(raw)) {
    (raw as [string, string][]).forEach(([key, value]) => { out[key] = value; });
  } else {
    Object.assign(out, raw);
  }

  return out;
}

function parseQueryParams(url: string): Record<string, string> | null {
  const idx = url.indexOf('?');
  if (idx === -1) return null;
  const params: Record<string, string> = {};
  url.slice(idx + 1).split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key && value !== undefined) {
      params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
    }
  });

  return params;
}

function parseRequestBody(body: BodyInit): unknown {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  if (body instanceof URLSearchParams) {
    const out: Record<string, string> = {};
    body.forEach((value, key) => { out[key] = value; });

    return out;
  }

  if (body instanceof FormData) {
    const out: Record<string, unknown> = {};
    body.forEach((value, key) => { out[key] = value; });

    return out;
  }

  return '[binary body]';
}

export function wrapFetchWithReactotron(fetchFn: FetchFn, options: FetchInterceptorOptions = {}): FetchFn {
  const ignoreContentTypes = options.ignoreContentTypes ?? DEFAULT_IGNORE_CONTENT_TYPES;

  return async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
    const reactotron = (console as any).tron;
    if (!reactotron?.apiResponse) {
      return fetchFn(input, init);
    }

    const url = input instanceof Request ? input.url : String(input);
    if (options.ignoreUrls?.test(url)) {
      return fetchFn(input, init);
    }

    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const requestBody = init?.body ?? null;
    const rawHeaders = init?.headers ?? (input instanceof Request ? input.headers : null);

    const tronRequest = {
      url,
      method,
      data: requestBody != null ? parseRequestBody(requestBody) : null,
      headers: normalizeHeaders(rawHeaders),
      params: parseQueryParams(url),
    };

    const stopTimer = reactotron.startTimer();

    try {
      const response = await fetchFn(input, init);
      const cloned = response.clone();

      const contentType = response.headers.get('content-type') ?? '';
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => { responseHeaders[key] = value; });

      const report = (body: unknown) => {
        reactotron.apiResponse(
          tronRequest,
          { body, status: response.status, headers: responseHeaders },
          stopTimer()
        );
      };

      if (!ignoreContentTypes.test(contentType)) {
        cloned.text()
          .then((text) => {
            try { report(JSON.parse(text)); } catch { report(text); }
          })
          .catch(() => report('~~~ read error ~~~'));
      } else {
        report('~~~ skipped ~~~');
      }

      return response;
    } catch (error) {
      reactotron.apiResponse(
        tronRequest,
        { body: error instanceof Error ? error.message : String(error), status: 0, headers: null },
        stopTimer()
      );
      throw error;
    }
  };
}
