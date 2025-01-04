import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  card: {
    padding: 4,
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
