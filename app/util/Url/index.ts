export const updateUrlHost = (url: string, newHost: string): string => {
  const urlObj = new URL(url);
  urlObj.host = newHost;
  return urlObj.toString();
};
