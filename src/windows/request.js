// Native React Native fills multipart boundaries; browser Request requires the
// Content-Type header to be omitted while it serializes FormData.
export function createDesktopRequest(input, init = {}) {
  if (init.body instanceof FormData) {
    const headers = new Headers(init.headers);
    if (/^multipart\/form-data\s*$/i.test(headers.get('content-type') || '')) headers.delete('content-type');
    init = { ...init, headers };
  }
  return new Request(input, init);
}
export function desktopRequestHeaders(request, init = {}) {
  const explicit = new Headers(init.headers);
  if (init.body instanceof FormData && /^multipart\/form-data\s*$/i.test(explicit.get('content-type') || '')) explicit.delete('content-type');
  // Chromium Request removes Cookie/User-Agent. They belong to the desktop
  // transport, whose cookie jar is managed by Lumen rather than the renderer.
  return { ...Object.fromEntries(request.headers), ...Object.fromEntries(explicit) };
}

export function preserveResponseCookies(response, headers) {
  const cookies = headers.filter(([name]) => name.toLowerCase() === 'set-cookie').map(([,value]) => value);
  const original = response.headers.get.bind(response.headers);
  // Chromium Response hides Set-Cookie even when the main process supplied it.
  Object.defineProperty(response.headers, 'get', { value: name => name.toLowerCase() === 'set-cookie' ? cookies.join(', ') || null : original(name) });
  return response;
}