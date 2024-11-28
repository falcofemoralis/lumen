export const updateUrlHost = (url: string, newHost: string): string => {
  const urlObj = new URL(url);
  const hostObj = new URL(newHost);

  return new URL(urlObj.pathname, hostObj.origin).toString();
};
