import { NUMBER_OF_COLUMNS } from 'Component/FilmGrid/FilmGrid.config';
import { ROW_GAP } from 'Component/FilmGrid/FilmGrid.style';
import Colors from 'Style/Colors';
import { calculateItemSize } from 'Style/Layout';
import CreateStyles, { scale } from 'Util/CreateStyles';

const windowWidth = calculateItemSize(NUMBER_OF_COLUMNS);
const cardWidth = windowWidth / NUMBER_OF_COLUMNS - scale(ROW_GAP);

export const POSTER_HEIGHT = cardWidth * (250 / 166);
export const INFO_PADDING_TOP = 4;
export const INFO_HEIGHT = scale(40) + scale(INFO_PADDING_TOP);
export const CARD_HEIGHT = POSTER_HEIGHT + INFO_HEIGHT;

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
    paddingTop: 8,
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
