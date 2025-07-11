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
