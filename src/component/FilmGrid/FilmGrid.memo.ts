import type { FilmGridItemProps } from './FilmGrid.type';

const sameValues = (first: object, second: object): boolean => {
  const entries = Object.entries(first);

  return entries.length === Object.keys(second).length
    && entries.every(([key, value]) => value === (second as Record<string, unknown>)[key]);
};

export const sameGridCardProps = (first: FilmGridItemProps, second: FilmGridItemProps): boolean => {
  const { item: firstItem, ...firstProps } = first;
  const { item: secondItem, ...secondProps } = second;

  return sameValues(firstProps, secondProps) && sameValues(firstItem, secondItem);
};