import Colors from 'Style/Colors';
import { calculateItemWidth } from 'Style/Layout';
import CreateStyles, { scale } from 'Util/CreateStyles';

import { FilmCardDimensions } from './FilmCard.type';

export const INFO_PADDING_TOP = 8;

export const calculateCardDimensions = (
  numberOfColumns: number,
  gap?: number,
  additionalWidth?: number,
): FilmCardDimensions => {
  const width = calculateItemWidth(numberOfColumns, gap, additionalWidth);

  const posterHeight = width * (250 / 166);
  const infoHeight = scale(40) + scale(INFO_PADDING_TOP);

  const height = posterHeight + infoHeight;

  return {
    width,
    height,
  };
};

export const styles = CreateStyles({
  card: {
    overflow: 'hidden',
  },
  posterWrapper: {
    width: '100%',
    height: 'auto',
  },
  poster: {
    aspectRatio: '166 / 250',
  },
  info: {
    width: '100%',
    backgroundColor: Colors.transparent,
    paddingTop: INFO_PADDING_TOP,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    paddingRight: 4,
  },
  subtitle: {
    fontSize: 10,
    paddingTop: 4,
    color: Colors.lightGray,
  },
  typeText: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 10,
  },
  filmAdditionalText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 10,
  },
});
