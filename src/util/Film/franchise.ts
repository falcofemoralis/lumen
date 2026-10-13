import type { FranchiseItem } from '../../type/FranchiseItem.interface';

const releaseYear = (item: FranchiseItem): number => {
  const match = String(item.year ?? '').match(/\b(?:18|19|20|21)\d{2}\b/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
};

/** Order cached and freshly fetched parts by release year without changing source data. */
export const getFranchiseChronology = (items?: readonly FranchiseItem[]): FranchiseItem[] =>
  [...(items ?? [])].sort((a, b) => {
    const aYear = releaseYear(a), bYear = releaseYear(b);
    return aYear === bYear ? 0 : aYear < bYear ? -1 : 1;
  });
