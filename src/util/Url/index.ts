/**
 * The scheme+authority a URL belongs to -- what a cookie jar and a bot check are both
 * scoped by.
 *
 * RN's `URL` does not reliably expose `.origin`, so this derives it from the parts that
 * are there, and falls back to matching the string itself when even parsing fails.
 */
export const getUrlOrigin = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl);

    if (url.protocol && url.host) {
      return `${url.protocol}//${url.host}`;
    }
  } catch {
    // not parseable -- the regex below is the last resort
  }

  const match = rawUrl.match(/^(https?:\/\/[^/]+)/i);

  return match ? match[1] : rawUrl;
};

export const updateUrlHost = (url: string, newHost: string): string => {
  if (!url.includes('http')) {
    return url;
  }

  const urlObj = new URL(url);
  const hostObj = new URL(newHost);

  return new URL(urlObj.pathname, hostObj.origin).toString();
};

export const removeParamFromUrl = (url: string, param: string): string => {
  const urlObj = new URL(url);
  urlObj.searchParams.delete(param);

  return urlObj.toString();
};

export const removeUrlHost = (url: string): string => {
  if (!url.includes('http')) {
    return url;
  }

  const urlObj = new URL(url);

  return urlObj.pathname;
};