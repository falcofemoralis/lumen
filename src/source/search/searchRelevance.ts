const normalize = (value: string) => value.normalize('NFKC').toLowerCase()
  .replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export const rankSearchResults = <T extends { title: string; originalTitle?: string }>(
  films: T[], query: string
): T[] => {
  const needle = normalize(query);
  if (!needle) return films;
  const words = needle.split(/\s+/);
  const score = (title: string) => {
    const text = normalize(title);
    if (text === needle) return 20000;
    const tokens = new Set(text.split(/\s+/));
    const matched = words.filter(word => tokens.has(word)).length;

    return (text.startsWith(`${needle } `) ? 8000 : text.includes(needle) ? 6000 : 0)
      + (matched === words.length ? 4000 : 0) + matched / words.length * 1000;
  };

  return films.map((film, index) => ({ film, index,
    score: Math.max(score(film.title), score(film.originalTitle ?? '')) }))
    .sort((a, b) => b.score - a.score || a.index - b.index).map(item => item.film);
};
