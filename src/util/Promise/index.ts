export async function processPromisesBatch<S,T>(
  items: S[],
  limit: number,
  fn: (item: S) => Promise<T>
): Promise<T[]> {
  let results: T[] = [];
  for (let start = 0; start < items.length; start += limit) {
    const end = start + limit > items.length ? items.length : start + limit;

    const slicedResults = await Promise.all(items.slice(start, end).map(fn));

    results = [
      ...results,
      ...slicedResults,
    ];
  }

  return results;
}
