import Colors from 'Style/Colors';
import { calculateItemWidth } from 'Style/Layout';
import CreateStyles, { scale } from 'Util/CreateStyles';

import { FilmCardDimensions } from './FilmCard.type';

export const INFO_HEIGHT = 65;
export const INFO_PADDING_HORIZONTAL = 8;
export const INFO_PADDING_VERTICAL = 4;

export const DEFAULT_SCALE = 1;
export const FOCUSED_SCALE = 1.1;

export const calculateCardDimensions = (
  numberOfColumns: number,
  gap?: number,
  additionalWidth?: number,
): FilmCardDimensions => {
  const width = calculateItemWidth(numberOfColumns, gap, additionalWidth);

  const posterHeight = width * (250 / 166);
  const infoHeight = scale(INFO_HEIGHT) + scale(INFO_PADDING_VERTICAL);

  const height = posterHeight + infoHeight;

  return {
    width,
    height,
  };
};

export const styles = CreateStyles({
  card: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  posterWrapper: {
    width: '100%',
    height: 'auto',
    flexDirection: 'column',
  },
  poster: {
    aspectRatio: '166 / 250',
  },
  posterFocused: {},
  info: {
    width: '100%',
    height: INFO_HEIGHT,
    backgroundColor: Colors.transparent,
    paddingHorizontal: INFO_PADDING_HORIZONTAL,
    paddingVertical: INFO_PADDING_VERTICAL,
  },
  infoFocused: {
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  titleFocused: {
    color: Colors.darkGray,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.lightGray,
  },
  subtitleFocused: {
    color: Colors.darkGray,
  },
  typeText: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 10,
  },
  filmAdditionalText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
