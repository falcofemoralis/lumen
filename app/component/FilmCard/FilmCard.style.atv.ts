import { NUMBER_OF_COLUMNS_TV } from 'Component/FilmGrid/FilmGrid.config';
import { ROW_GAP } from 'Component/FilmGrid/FilmGrid.style.atv';
import Colors from 'Style/Colors';
import CreateStyles, { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

const windowWidth = getWindowWidth() - scale(ROW_GAP);
const cardWidth = windowWidth / NUMBER_OF_COLUMNS_TV - scale(ROW_GAP);

export const POSTER_HEIGHT = cardWidth * (250 / 166);
export const INFO_PADDING = 8;
export const INFO_PADDING_TOP = 4;
export const INFO_HEIGHT = scale(60) + scale(INFO_PADDING) + scale(INFO_PADDING_TOP);
export const CARD_HEIGHT_TV = POSTER_HEIGHT + INFO_HEIGHT;
export const DEFAULT_SCALE = 1;
export const FOCUSED_SCALE = 1.1;
export const BORDER_RADIUS = 10;

export const styles = CreateStyles({
  card: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  cardThumbnail: {
    backgroundColor: Colors.lightBackground,
    borderRadius: BORDER_RADIUS,
  },
  poster: {
    height: '100%',
    width: '100%',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  posterFocused: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  info: {
    width: '100%',
    backgroundColor: Colors.transparent,
    padding: INFO_PADDING,
    paddingTop: INFO_PADDING_TOP,
  },
  infoFocused: {
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
    paddingRight: INFO_PADDING * 2,
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
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 1,
    fontSize: 10,
    borderBottomLeftRadius: 8,
  },
  filmAdditionalText: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 1,
    fontSize: 10,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: BORDER_RADIUS,
  },
});
