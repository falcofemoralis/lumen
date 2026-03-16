import { useGridLayout } from 'Component/ThemedGrid/useGridLayout';
import { useConfigContext } from 'Context/ConfigContext';
import { useMemo } from 'react';
import { useAppTheme } from 'Theme/context';

import { INFO_HEIGHT } from './FilmCard.style';
import { INFO_HEIGHT as INFO_HEIGHT_TV } from './FilmCard.style.atv';

export const useFilmCardDimensions = (
  numberOfColumns: number,
  gap?: number,
  additionalWidth?: number
) => {
  const { isTV } = useConfigContext();
  const { scale } = useAppTheme();
  const { itemWidth: width } = useGridLayout(numberOfColumns, gap, additionalWidth);

  const height = useMemo(() => {
    const posterHeight = width * (250 / 166);
    const infoHeight = scale(isTV ? INFO_HEIGHT_TV : INFO_HEIGHT);

    return posterHeight + infoHeight;
  }, [width, scale, isTV]);

  return {
    width,
    height,
  };
};