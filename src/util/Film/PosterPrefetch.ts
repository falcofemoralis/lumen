/** Shared bounded queue: scrolling back does not download the same poster again. */
export function createPosterPrefetchQueue(load: (url: string) => Promise<boolean>, concurrency = 4) {
  const seen = new Map<string, number>();
  const pending: string[] = [];
  let active = 0;
  const pump = () => {
    while (active < concurrency && pending.length) {
      const url = pending.shift()!;
      active++;
      Promise.resolve().then(() => load(url)).catch(() => false).finally(() => { active--; pump(); });
    }
  };
  return (urls: string[]) => {
    for (const url of urls) {
      if (!/^https?:\/\//i.test(url)) continue;
      const checked = seen.get(url);
      if (checked && Date.now() - checked < 5 * 60 * 1000) continue;
      // Only retain a small look-ahead window when the user scrolls quickly.
      if (pending.length >= 24) break;
      seen.set(url, Date.now());
      pending.push(url);
    }
    while (seen.size > 512) seen.delete(seen.keys().next().value!);
    pump();
  };
}