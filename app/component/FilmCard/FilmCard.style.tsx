import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const BORDER_RADIUS = 12;

export const styles = CreateStyles({
  card: {
    padding: 4,
    overflow: 'hidden',
  },
  cardThumbnail: {
    padding: 0,
    margin: 2,
    backgroundColor: Colors.lightBackground,
    aspectRatio: '166 / 250',
    borderRadius: BORDER_RADIUS,
  },
  posterWrapper: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS,
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
    fontWeight: 'bold',
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
    paddingHorizontal: 8,
    paddingVertical: 1,
    fontSize: 10,
    borderBottomLeftRadius: 8,
  },
  filmAdditionalText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 1,
    fontSize: 10,
    borderTopRightRadius: 8,
  },
});
