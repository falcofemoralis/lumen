import { useLayout } from 'Hooks/useLayout';
import { useMemo } from 'react';

export const useGridLayout = (
  numberOfColumns: number,
  gap?: number,
  additionalWidth?: number
) => {
  const { width } = useLayout(additionalWidth);

  const layout = useMemo(() => {
    const pureGridWidth = width - ((gap || 0) * (numberOfColumns - 1));

    return {
      gridWidth: pureGridWidth,
      itemWidth: pureGridWidth / numberOfColumns,
    };
  }, [width, gap, numberOfColumns]);

  return layout;
};