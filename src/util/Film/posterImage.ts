export const filmPosterUrl = (attributes?: Record<string, string | undefined>): string => {
  const value = ['data-src', 'data-original', 'src'].map(key => attributes?.[key]?.trim()).find(Boolean) ?? '';
  return value.startsWith('//') ? 'https:' + value : value;
};